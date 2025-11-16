
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
   - Make it clear this is general guidance, not legal advice.

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
    planDepth,
  } = input;

  // --------- Detect depth from UI value ----------
  const depthRaw = (planDepth || "").toLowerCase().trim();

  // Treat as "quick" if the text contains "quick" or "summary"
  // e.g. "Quick summary", "Short / quick plan" etc.
  const isQuick =
    depthRaw === "" ||
    depthRaw.includes("quick") ||
    depthRaw.includes("summary") ||
    depthRaw.includes("basic") ||
    depthRaw.includes("short");

  // Optional: log for debugging (safe on server)
  console.log("Business plan depth:", planDepth, "=> isQuick:", isQuick);

  // ---------- PROMPTS ----------

  // Short, founder-friendly version
  const quickPrompt = `
Generate a SHORT, FOUNDER-FRIENDLY business plan.

OUTPUT RULES (VERY IMPORTANT):
- Use EXACTLY these 6 top-level headings, in this order:
  1) ## Executive Summary
  2) ## Problem & Solution
  3) ## Target Customer & Market Snapshot
  4) ## Go-To-Market Plan (First 6–12 Months)
  5) ## Simple Year 1 Numbers
  6) ## Next 3 Action Steps
- Each heading-এর নিচে 3–6টা bullet / ছোট paragraph রাখো।
- মোট শব্দ ideally 600–800 এর মধ্যে রাখো (এর বেশি না)।
- খুব academic না, বাস্তবধর্মী, founder-friendly language ব্যবহার করবে।
`;

  // Deep, investor-ready version
  const proPrompt = `
Generate a DETAILED, INVESTOR-READY business plan.

OUTPUT RULES (VERY IMPORTANT):
- Use EXACTLY these 12 top-level headings, in this order:

  1) ## Executive Summary
  2) ## Problem & Opportunity
  3) ## Target Customer Profile
  4) ## Market Size (TAM / SAM / SOM)
  5) ## Competitor & Alternative Analysis
  6) ## Unique Value Proposition (UVP)
  7) ## Product / Service Offering
  8) ## Marketing & Sales Strategy
  9) ## Operations & Team
  10) ## 3-Year Financial Projection
  11) ## SWOT Analysis
  12) ## Legal, Compliance & Risks

- প্রতিটা section-এ 2–4টা sub-heading বা bullet থাকতে পারে।
- "Competitor & Alternative Analysis" অংশে কমপক্ষে 3টি প্রতিযোগীর তুলনা
  Markdown-style bullet/table format-এ দাও (e.g. Competitor, Strength, Weakness)।
- "3-Year Financial Projection"-এ Year 1 / Year 2 / Year 3 এর জন্য:
  - estimated revenue
  - gross margin (approx)
  - key cost blocks (team, marketing, operations)
  - very simple profit estimate
- Bangladesh বা USA mention থাকলে সেই context অনুযায়ী সাধারণ legal/compliance পয়েন্ট যোগ করবে,
  but সবসময় উল্লেখ করবে যে এটা general guidance, formal legal advice নয়।
- টোন হবে practical, investor-friendly এবং পরিষ্কার।
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
You are generating a ${isQuick ? "QUICK SUMMARY" : "FULL INVESTOR-READY"} business plan.

Here is the business context:
${scenarioPrompt}

Now follow the rules for the ${
    isQuick ? "SHORT 6-SECTION PLAN (quick summary)" : "DETAILED 12-SECTION PLAN (investor-ready)"
  }:

${isQuick ? quickPrompt : proPrompt}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    // investor-ready version যেন কেটে না যায়, তাই একটু বেশি max_tokens
    max_tokens: isQuick ? 900 : 2600,
  });

  return (
    completion.choices?.[0]?.message?.content ??
    "Sorry, I could not generate a business plan. Please try again."
  );
}
