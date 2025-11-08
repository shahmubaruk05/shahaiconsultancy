'use server';

/**
 * @fileOverview Implements the AskShah chatbot flow.
 *
 * - askShah - A function that handles user queries and returns AI-powered advice.
 * - AskShahInput - The input type for the askShah function.
 * - AskShahOutput - The return type for the askShah function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskShahInputSchema = z.object({
  query: z.string().describe('The user query about startups, funding, licensing, tax, strategy, business, and marketing.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type AskShahInput = z.infer<typeof AskShahInputSchema>;

const AskShahOutputSchema = z.object({
  answer: z.string().describe('The AI-powered answer to the user query.'),
});
export type AskShahOutput = z.infer<typeof AskShahOutputSchema>;

export async function askShah(input: AskShahInput): Promise<AskShahOutput> {
  return askShahFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askShahPrompt',
  input: {schema: AskShahInputSchema},
  output: {schema: AskShahOutputSchema},
  prompt: `You are Shah, an AI-powered chatbot assistant providing advice on startups, funding, licensing, tax, strategy, business, and marketing.

  {% if conversationHistory %}
  Here's the previous conversation history:
  {{#each conversationHistory}}
  {{this.role}}: {{this.content}}
  {{/each}}
  {% endif %}

  User query: {{{query}}}

  Respond with helpful and informative advice. Be concise and professional in your answer.`,
});

const askShahFlow = ai.defineFlow(
  {
    name: 'askShahFlow',
    inputSchema: AskShahInputSchema,
    outputSchema: AskShahOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
