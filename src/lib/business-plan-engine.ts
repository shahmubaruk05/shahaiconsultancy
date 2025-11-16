
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type BusinessPlanInput = {
  businessName: string;
  industry: string;
  country: string;
  city?: string;
  businessType?: string;
  targetCustomer: string;
  problem: string;
  solution: string;
  revenueModel: string;
  fundingNeed?: string;
  founderBackground?: string;
  planDepth?: "quick" | "pro";
};

const BASE_SYSTEM_PROMPT = `
You are Shah Mubaruk’s AI Startup Analyst and Business Planner.

Your job is to generate a deeply researched, investor-ready business plan.

Always follow these rules:

1) Structure the output into these 12 sections, with clear headings:

   1. Executive Summary
   2. Problem & Opportunity
   3. Target Customer Profile
   4. Market Size (TAM / SAM / SOM with approximate numbers and logic)
   5. Competitor Analysis (table format)
   6. Unique Value Proposition & Differentiation
   7. Product / Service Description
   8. Marketing & Sales Strategy
   9. Operations & Team Plan
   10. Financial Projection (3 years) with a simple revenue model
   11. SWOT Analysis
   12. Legal, Licensing & Compliance

2) If the country is Bangladesh:
   - Use RJSC company formation basics, trade license, TIN, VAT, local tax.
   - Mention typical compliance items in simple language (not as legal advice).

3) If the country is USA:
   - Reference LLC / Corporation basics, EIN, state registration, basic sales tax concepts.
   - Make it clear this is general guidance, not as legal advice.

4) Use realistic assumptions and clearly label them as estimates.
   - For example: "Assumption: average order size BDT 800", etc.

5) Make the tone helpful, practical, and founder-friendly.
   - Simple English with occasional Bangla terms is ok.
   - Avoid very technical legal language.

6) Format the output with:
   - Clear headings (##)
   - Bullets and numbered lists
   - Tables where needed (Competitors, Financials)
   - Blank lines between sections so it is easy to read and export.

7) The output should be long and detailed enough to feel "investor-ready",
   not just a short summary.
`;

export async function generateBusinessPlan(input: BusinessPlanInput): Promise<string> {
  const {
    businessName,
    industry,
    country,
    city,
    businessType,
    targetCustomer,
    problem,
    solution,
    revenueModel,
    fundingNeed,
    founderBackground,
    planDepth = "pro",
  } = input;

  const isQuick = planDepth === "quick";

  const quickPrompt = `
Generate a SHORT, founder-friendly business plan summary.

Style:
- Max ~700 words
- Very skimmable
- Use clear headings and bullet points
- No big tables, no long paragraphs

Structure exactly like this:

1. Overview
   - 2–3 bullet points: what the business does, where, for whom.

2. Problem & Solution
   - 2–3 bullets on the main pain points.
   - 2–3 bullets on how this business solves them.

3. Target Customer & Market Snapshot
   - 3–5 bullets describing the ideal customer.
   - 3–5 bullets with an approximate market size (TAM/SAM) in simple language.

4. Simple Go-To-Market Plan (First 6–12 months)
   - Bullet list of marketing channels, example campaigns, and pricing approach.

5. Basic Numbers (Year 1)
   - A small bullet list with:
     - Assumed number of customers
     - Average order size / monthly revenue
     - Rough annual revenue
     - Key monthly costs

6. Next 3 Action Steps
   - 3 concrete things the founder should do next.

Make everything very practical and to-the-point, not academic.
Use simple English with occasional Bangla terms if helpful.
`;

  const proPrompt = `
Generate a DEEP, INVESTOR-READY business plan.

It must follow the 12-section structure from the system prompt
(Executive Summary, Problem & Opportunity, Target Customer Profile, Market Size,
Competitor Analysis table, UVP, Product/Service, Marketing & Sales, Operations & Team,
3-year Financial Projection, SWOT, Legal & Compliance).

Requirements:
- Length: typically 2000+ words if enough input is provided.
- Use detailed headings with "##" and subheadings where needed.
- Include realistic numeric examples for market size and a simple 3-year projection
  (Year 1, Year 2, Year 3) with revenue and major cost lines.
- Include a clear competitor comparison in table-like Markdown.
- Explicitly mention Bangladesh or USA legal / compliance basics where relevant,
  but always as general guidance (not legal advice).
- Keep the tone practical and founder-friendly, not too academic.
`;

  const scenarioPrompt = `
Business name: ${businessName || "N/A"}
Industry / sector: ${industry || "N/A"}
Country: ${country || "N/A"}
City / region: ${city || "N/A"}
Business type (service / product / SaaS / e-commerce / agency etc.): ${businessType || "N/A"}

Target customer:
${targetCustomer || "N/A"}

Problem we are solving:
${problem || "N/A"}

Our solution / offering:
${solution || "N/A"}

Revenue model (how we make money):
${revenueModel || "N/A"}

Funding need (if any):
${fundingNeed || "N/A"}

Founder background / strengths:
${founderBackground || "N/A"}
`;

  const userPrompt = `
You are preparing a ${isQuick ? "QUICK SUMMARY" : "FULL INVESTOR-READY"} business plan.

Here is the business context:
${scenarioPrompt}

Now follow the specific instructions for ${
    isQuick ? "the QUICK SUMMARY plan" : "the INVESTOR-READY plan"
  } below:

${isQuick ? quickPrompt : proPrompt}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return (
    completion.choices?.[0]?.message?.content ??
    "Sorry, I could not generate a business plan. Please try again."
  );
}
