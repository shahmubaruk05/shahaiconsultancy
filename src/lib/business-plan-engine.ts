
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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
  planDepth?: string; // "quick" | "investor"
};

const BASE_SYSTEM_PROMPT = `
You are a senior startup consultant and business plan writer.

You must strictly follow the requested template.
Do NOT mix the quick summary template and the investor-ready template.
Do NOT add or remove top-level sections that are not in the template.
`;

const QUICK_TEMPLATE = `
Generate a SHORT business plan summary.

You MUST use EXACTLY these 5 top-level headings, in this order:

1) ## Business Overview
2) ## Problem & Solution
3) ## Target Customers
4) ## Simple Revenue Model
5) ## Next 3 Action Steps

Rules:
- Each section should be 3–6 short bullet points or 1–2 short paragraphs.
- Total length should be around 600–800 words maximum.
- Do NOT include any other headings outside these 5.
- Keep the tone simple, founder-friendly and practical.
`;

const INVESTOR_TEMPLATE = `
Generate a FULL INVESTOR-READY business plan.

You MUST use EXACTLY these 18 top-level headings, in this order:

1) ## Executive Summary
2) ## Company Description
3) ## Mission & Vision
4) ## Founder Background
5) ## Problem Statement
6) ## Market Opportunity (TAM / SAM / SOM)
7) ## Target Customer Persona
8) ## Competitor Analysis
9) ## Unique Value Proposition
10) ## Product / Service Offering
11) ## Business Model & Revenue Streams
12) ## Go-To-Market (GTM) Strategy
13) ## Marketing Strategy
14) ## Operations & Team Plan
15) ## 3–5 Year Financial Projection
16) ## Funding Requirements & Use of Funds
17) ## Key Risks & Mitigation
18) ## Roadmap & Milestones

Rules:
- Use all 18 sections. Do NOT skip or merge them.
- For "Competitor Analysis", include at least 3 competitors and compare them in bullet/table style.
- For "Financial Projection", include a simple Year 1 / Year 2 / Year 3 revenue & cost breakdown.
- If country is Bangladesh, mention RJSC, trade license, TIN, VAT in relevant sections (not as legal advice).
- If country is USA, mention LLC, EIN, state registration, sales tax basics in relevant sections (not as legal advice).
- Tone must be professional, structured, and investor-friendly.
- Length should feel like a long, detailed document (roughly 2000+ words if enough info is provided).
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

  const depthRaw = (planDepth || "").toLowerCase().trim();

  // Only "quick" is quick. Everything else will use investor template.
  const isQuick = depthRaw === "quick";

  const scenario = `
Business Name: ${businessName || "N/A"}
Industry / Sector: ${industry || "N/A"}
Country: ${country || "N/A"}
City / Region: ${city || "N/A"}
Business Type: ${businessType || "N/A"}

Target Customer:
${targetCustomer || "N/A"}

Problem:
${problem || "N/A"}

Solution:
${solution || "N/A"}

Revenue Model:
${revenueModel || "N/A"}

Funding Need:
${fundingNeed || "N/A"}

Founder Background:
${founderBackground || "N/A"}
`;

  const userPrompt = `
You will now generate a ${isQuick ? "QUICK SUMMARY (5 sections only)" : "FULL INVESTOR-READY PLAN (18 sections)"}.

Here is the business context:
${scenario}

Now follow this template STRICTLY:

${isQuick ? QUICK_TEMPLATE : INVESTOR_TEMPLATE}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: isQuick ? 900 : 2800,
  });

  return (
    completion.choices?.[0]?.message?.content ??
    "Sorry, I could not generate a business plan. Please try again."
  );
}

    