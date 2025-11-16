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
  planDepth?: "quick" | "pro";
};


export async function generateBusinessPlan(data: any) {
  const {
    businessName,
    sector,
    country,
    description,
    targetCustomer,
    revenueModel,
    competitors,
    planDepth
  } = data;

  // ---- DEPTH-BASED PROMPT ----
  let depthPrompt = "";

  if (planDepth === "quick") {
    depthPrompt = `
Generate a short 1–2 page lightweight business plan.
Sections required:
1. Problem
2. Solution
3. Target Customer
4. Revenue Model
5. Competitor Overview
6. Next Steps
Keep it concise and easy to read.
`;
  }

  if (planDepth === "standard") {
    depthPrompt = `
Generate a mid-level detailed business plan (4–6 pages).
Sections required:
1. Executive Summary
2. Problem & Opportunity
3. Product/Service Description
4. Market Research & Target Customer
5. Competitors Breakdown
6. Business Model & Monetization
7. Go-to-Market Strategy
8. Marketing Plan
9. Team & Operations Plan
10. Risk Analysis
11. 12-Month Roadmap
`;
  }

  if (planDepth === "investor") {
    depthPrompt = `
Generate a full **investor-ready business plan (10–15 pages)**.
STRICTLY include the following 15 sections:

1. Executive Summary  
2. Founder Background  
3. Vision & Mission  
4. Problem (with data)  
5. Market Opportunity (TAM, SAM, SOM)  
6. Product/Service + Unique Value Proposition  
7. Business Model & Pricing  
8. Traction (or expected traction if new)  
9. Competitor Matrix (table-format text)  
10. GTM Strategy (step-by-step)  
11. Marketing Strategy (digital + offline)  
12. Financial Projection (3 years, table text)  
13. Funding Ask & Use of Funds  
14. Risk Factors & Mitigation  
15. Long-Term Roadmap (3 years)  

Write in clear, structured, investor-friendly tone.
Make it long and detailed.
`;
  }

  const prompt = `
You are a professional startup business plan writer.

Generate a business plan based on the following inputs:

Business Name: ${businessName}
Industry: ${sector}
Country: ${country}
Business Description: ${description}
Target Customer: ${targetCustomer}
Revenue Model: ${revenueModel}
Competitors: ${competitors}

${depthPrompt}

Return clean markdown formatting.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a senior startup consultant." },
      { role: "user", content: prompt }
    ],
  });

  return completion.choices[0].message?.content || "No result.";
}
