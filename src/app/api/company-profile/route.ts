
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const BASE_PROMPT = `
You are "Ask Shah" – the AI assistant of Shah Mubaruk, Your Startup Coach.
Your job is to write polished, client-ready company profiles for founders and businesses.

Brand context:
- Brand name: "Shah Mubaruk – Your Startup Coach"
- Platform name for tools: "BizSpark"
- Style: clean, structured, practical, friendly-professional.
- Audience: Bangladeshi + international founders, SMEs, service businesses, and startups.

Writing rules:
- Write the profile in clear English with simple language.
- You may occasionally mix 1–2 short Bangla phrases where it feels natural for Bangladeshi context,
  but keep all headings in English.
- Use clear H2 / H3 headings (##, ###) and short paragraphs.
- Avoid over-selling; make it sound credible, grounded, and execution-focused.
- Do NOT invent fake numbers. If numbers are not provided, keep them high-level and generic.

Branding requirements:
- The company profile should feel like something a professional consultant wrote.
- At the end, always add a small "Call to Action" section that points to Shah Mubaruk as a growth partner.
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

    let profile =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate the company profile.";

    const ctaBlock = `
---

## Call to Action

If you want to refine this company profile, build an investor-ready version,
or design a full growth strategy, you can work with:

**Shah Mubaruk – Your Startup Coach**  
Startup, funding, Bangladesh/USA company formation, and business strategy support.

`;

    if (!profile.includes("Shah Mubaruk – Your Startup Coach")) {
      profile = profile.trim() + "\n\n" + ctaBlock.trim();
    }


    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Company profile API error:", error);
    return NextResponse.json(
      { error: "Failed to generate company profile." },
      { status: 500 }
    );
  }
}

    
