'use server';

/**
 * @fileOverview Generates a pitch deck outline based on user inputs.
 *
 * - generatePitchDeckOutline - A function that generates a pitch deck outline.
 * - GeneratePitchDeckOutlineInput - The input type for the generatePitchDeckOutline function.
 * - GeneratePitchDeckOutlineOutput - The return type for the generatePitchDeckOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePitchDeckOutlineInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessDescription: z.string().describe('A brief description of the business.'),
  targetAudience: z.string().describe('The target audience for the business.'),
  problemStatement: z.string().describe('The problem the business is solving.'),
  solutionStatement: z.string().describe('The solution the business provides.'),
  uniqueSellingProposition: z.string().describe('The unique selling proposition of the business.'),
  valueProposition: z.string().describe('The value proposition of the business.'),
  revenueModel: z.string().describe('The revenue model of the business.'),
  marketSize: z.string().describe('The market size for the business.'),
  competitiveLandscape: z.string().describe('The competitive landscape of the business.'),
  financialProjections: z.string().describe('The financial projections for the business.'),
  fundingRequirements: z.string().describe('The funding requirements for the business.'),
});

export type GeneratePitchDeckOutlineInput = z.infer<
  typeof GeneratePitchDeckOutlineInputSchema
>;

const GeneratePitchDeckOutlineOutputSchema = z.array(
  z.object({
    slideTitle: z.string().describe('The title of the slide.'),
    slideContentSuggestions: z
      .array(z.string())
      .describe('Suggestions for the content of the slide.'),
  })
);

export type GeneratePitchDeckOutlineOutput = z.infer<
  typeof GeneratePitchDeckOutlineOutputSchema
>;

export async function generatePitchDeckOutline(
  input: GeneratePitchDeckOutlineInput
): Promise<GeneratePitchDeckOutlineOutput> {
  return generatePitchDeckOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePitchDeckOutlinePrompt',
  input: {schema: GeneratePitchDeckOutlineInputSchema},
  output: {schema: GeneratePitchDeckOutlineOutputSchema},
  prompt: `You are an expert pitch deck consultant. You will generate a pitch deck outline with slide suggestions based on the business information provided.

Business Name: {{{businessName}}}
Business Description: {{{businessDescription}}}
Target Audience: {{{targetAudience}}}
Problem Statement: {{{problemStatement}}}
Solution Statement: {{{solutionStatement}}}
Unique Selling Proposition: {{{uniqueSellingProposition}}}
Value Proposition: {{{valueProposition}}}
Revenue Model: {{{revenueModel}}}
Market Size: {{{marketSize}}}
Competitive Landscape: {{{competitiveLandscape}}}
Financial Projections: {{{financialProjections}}}
Funding Requirements: {{{fundingRequirements}}}

Generate a pitch deck outline with slide suggestions. The outline should include the following slides:

1. Title Slide
2. Problem
3. Solution
4. Market Opportunity
5. Product
6. Business Model
7. Traction
8. Team
9. Financials
10. Funding Request
11. Contact Information`,
});

const generatePitchDeckOutlineFlow = ai.defineFlow(
  {
    name: 'generatePitchDeckOutlineFlow',
    inputSchema: GeneratePitchDeckOutlineInputSchema,
    outputSchema: GeneratePitchDeckOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
