'use server';

/**
 * @fileOverview A startup idea validation AI agent.
 *
 * - validateStartupIdea - A function that handles the startup idea validation process.
 * - ValidateStartupIdeaInput - The input type for the validateStartupIdea function.
 * - ValidateStartupIdeaOutput - The return type for the validateStartupIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateStartupIdeaInputSchema = z.object({
  ideaDescription: z
    .string()
    .describe('A detailed description of the startup idea.'),
});
export type ValidateStartupIdeaInput = z.infer<
  typeof ValidateStartupIdeaInputSchema
>;

const ValidateStartupIdeaOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'A score from 1-100 representing the viability of the startup idea.'
    ),
  summary: z.string().describe('A brief summary of the startup idea.'),
  risks: z
    .array(z.string())
    .describe('Potential risks associated with the startup idea.'),
  recommendations: z
    .array(z.string())
    .describe('Recommendations to refine the startup idea.'),
});
export type ValidateStartupIdeaOutput = z.infer<
  typeof ValidateStartupIdeaOutputSchema
>;

export async function validateStartupIdea(
  input: ValidateStartupIdeaInput
): Promise<ValidateStartupIdeaOutput> {
  return validateStartupIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateStartupIdeaPrompt',
  input: {schema: ValidateStartupIdeaInputSchema},
  output: {schema: ValidateStartupIdeaOutputSchema},
  prompt: `You are an expert startup validator.

You will use this information to score, summarise, identify the risks, and provide recommendations to refine the startup idea.

Consider these dimensions when scoring:

- Market size and potential
- Competitive landscape
- Execution strategy
- Financial viability

Description: {{{ideaDescription}}}`,
});

const validateStartupIdeaFlow = ai.defineFlow(
  {
    name: 'validateStartupIdeaFlow',
    inputSchema: ValidateStartupIdeaInputSchema,
    outputSchema: ValidateStartupIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
