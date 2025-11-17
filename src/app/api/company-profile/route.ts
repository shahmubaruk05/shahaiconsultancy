
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const BASE_PROMPT = `
You are "Ask Shah" – an AI startup advisor and copywriter for Shah Mubaruk.
Write a professional, well-structured company profile based on the given form data.
Use clear headings and short paragraphs. Mix simple English with light Bangla if the context is Bangladeshi, but keep headings in English.
Do NOT invent random numbers; only use what user gives or keep it high-level.
`;

const QUICK_TEMPLATE = `
Write a SHORT 1–2 page company profile.
Use these sections as H2 headings:
1. Company Overview
2. What We Do
3. Our Customers
4. Why Choose Us

Keep each section brief (3–5 short paragraphs total). No financial details or investment ask.
`;

const DETAILED_TEMPLATE = `
Write a DETAILED multi-section company profile.
Use these sections as H2 headings:
1. Company Overview
2. Vision & Mission
3. Products & Services
4. Target Customers & Market
5. Competitive Advantage
6. Operations & Team
7. Social Impact or Sustainability (if relevant)
8. Call to Action

Tone: professional but friendly, like a consulting firm's profile. 6–10 paragraphs total.
`;

const INVESTOR_TEMPLATE = `
Write an INVESTOR-READY company profile focused on growth and funding potential.
Use these sections as H2 headings:
1. Executive Summary
2. Problem & Opportunity
3. Our Solution & Business Model
4. Market Size & Traction (current stage, any numbers or milestones)
5. Competitive Advantage & Moat
6. Team & Advisors
7. Financial Snapshot & Growth Plan (high-level)
8. Investment Ask & Use of Funds
9. Call to Action for Investors / Strategic Partners

Tone: confident, data-driven, investor-focused. Make it clearly different from a normal brochure.
`;


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyName,
      industry,
      country,
      targetCustomers,
      servicesOrProducts,
      foundedYear,
      coreValue,
      keyStrengths,
      sustainability,
      depth,
    } = body;

    let depthTemplate = QUICK_TEMPLATE;
    if (depth === "detailed") depthTemplate = DETAILED_TEMPLATE;
    if (depth === "investor") depthTemplate = INVESTOR_TEMPLATE;
    
    const systemPrompt = `${BASE_PROMPT}\n\n${depthTemplate}`;

    const userContent = `
Company name: ${companyName || "N/A"}
Industry / Sector: ${industry || "N/A"}
Country: ${country || "N/A"}
Target customers: ${targetCustomers || "N/A"}
Services / products: ${servicesOrProducts || "N/A"}
Founded year: ${foundedYear || "N/A"}
Core value / motto: ${coreValue || "N/A"}
Key strengths: ${keyStrengths || "N/A"}
Social impact / sustainability: ${sustainability || "N/A"}
Requested profile depth: ${depth || "quick"}

Please generate the company profile now.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
    });

    const profile =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate the company profile.";

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Company profile API error:", error);
    return NextResponse.json(
      { error: "Failed to generate company profile." },
      { status: 500 }
    );
  }
}

    