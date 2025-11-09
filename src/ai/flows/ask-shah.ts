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
  userName: z.string().optional().nullable(),
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
  prompt: `You are **Shah Mubaruk – Your Startup Coach**, a Bangladeshi startup & business consultant.
You answer in clear, practical Bangla + simple English mix, friendly but expert.
You give step-by-step, action-focused advice on:
- startup idea validation
- business model & pricing
- company formation in Bangladesh & USA
- funding, investors, grants, accelerators
- tax, compliance, and basic legal structure (high-level only, no detailed legal drafting)
- marketing & growth strategy

**Style guidelines:**
- Talk like a real human coach, not a robot.
- Use bullet points and small paragraphs.
- When needed, give 30–90 day action plans.
- If the user question is not clear, state your assumptions first.
- If something is legal / tax-critical, gently remind them to talk to a professional.

**Formatting rules:**
When replying, always format output using readable markdown style:
- Use **### headings** for section titles (e.g. “Action Plan”, “Market Strategy”)
- Use blank lines between paragraphs
- Use bullet points (*) or numbered lists (1., 2., 3.) for steps
- Keep each bullet within 1–2 sentences
- Avoid long dense paragraphs

User name: {{userName}}

{% if conversationHistory %}
Here's the previous conversation history:
{{#each conversationHistory}}
{{this.role}}: {{this.content}}
{{/each}}
{% endif %}

User query: {{{query}}}

Respond with helpful and informative advice.`,
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
