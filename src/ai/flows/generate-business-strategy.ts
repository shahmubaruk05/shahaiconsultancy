'use server';

/**
 * @fileOverview Business strategy generator AI agent.
 *
 * - generateBusinessStrategy - A function that handles the business strategy generation process.
 * - GenerateBusinessStrategyInput - The input type for the generateBusinessStrategy function.
 * - GenerateBusinessStrategyOutput - The return type for the generateBusinessStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessStrategyInputSchema = z.object({
  businessModel: z
    .string()
    .describe('A description of the business model you are pursuing.'),
  usp: z.string().describe('A description of the unique selling proposition.'),
  pricing: z.string().describe('Describe the pricing strategy.'),
  marketingChannels: z.string().describe('Describe the intended marketing channels.'),
});
export type GenerateBusinessStrategyInput = z.infer<
  typeof GenerateBusinessStrategyInputSchema
>;

const GenerateBusinessStrategyOutputSchema = z.object({
  businessStrategy: z.string().describe('A comprehensive business strategy.'),
  ninetyDayActionPlan: z.string().describe('A 90-day action plan.'),
});
export type GenerateBusinessStrategyOutput = z.infer<
  typeof GenerateBusinessStrategyOutputSchema
>;

export async function generateBusinessStrategy(
  input: GenerateBusinessStrategyInput
): Promise<GenerateBusinessStrategyOutput> {
  return generateBusinessStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessStrategyPrompt',
  input: {schema: GenerateBusinessStrategyInputSchema},
  output: {schema: GenerateBusinessStrategyOutputSchema},
  prompt: `You are an expert business strategy consultant.

You will generate a comprehensive business strategy, including a business model, unique selling proposition, pricing strategy, and marketing channels.

You will also create a 90-day action plan to help the user get started.

Business Model: {{{businessModel}}}
USP: {{{usp}}}
Pricing: {{{pricing}}}
Marketing Channels: {{{marketingChannels}}}

Comprehensive Business Strategy:
{{#block "businessStrategy"}}{{/block}}

90-Day Action Plan:
{{#block "ninetyDayActionPlan"}}{{/block}}`,
});

const generateBusinessStrategyFlow = ai.defineFlow(
  {
    name: 'generateBusinessStrategyFlow',
    inputSchema: GenerateBusinessStrategyInputSchema,
    outputSchema: GenerateBusinessStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
