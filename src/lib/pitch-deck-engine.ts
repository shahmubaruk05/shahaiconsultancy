import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type PitchDeckInput = {
  startupName: string;
  oneLiner: string;
  industry: string;
  country: string;
  targetAudience: string;
  problem: string;
  solution: string;
  traction?: string;
  revenueModel: string;
  competitors: string;
  fundingNeed: string;
  team: string;
};

const SYSTEM_PROMPT = `
You are a senior startup consultant and pitch deck expert.
Your job is to create a complete 12-slide pitch deck outline
formatted clearly with slide numbers, titles, and bullet points.

All output must use clean Markdown formatting:

### Slide {number}: {Title}
- Bullet 1
- Bullet 2
- Bullet 3

Follow EXACTLY this slide structure:

1. Title Slide  
2. Problem  
3. Solution  
4. Market Size (TAM/SAM/SOM, approximate numbers)  
5. Product / Key Features  
6. Business Model  
7. Traction  
8. Competitor Analysis (bullet comparison)  
9. Unique Value Proposition  
10. Go-To-Market Strategy  
11. Financial Projection (3 years)  
12. Team  
13. Funding Ask & Use of Funds  

Traction should be short if early-stage.
Use startup vocabulary, investor tone, and real examples.
`;

export async function generatePitchDeck(input: PitchDeckInput) {
  const prompt = `
Startup name: ${input.startupName}
One-liner: ${input.oneLiner}
Industry: ${input.industry}
Country: ${input.country}
Target audience: ${input.targetAudience}

Problem:
${input.problem}

Solution:
${input.solution}

Traction (if any):
${input.traction}

Revenue Model:
${input.revenueModel}

Competitors:
${input.competitors}

Funding Need:
${input.fundingNeed}

Team:
${input.team}

Generate the full pitch deck outline now:
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 2400,
  });

  return (
    completion.choices?.[0]?.message?.content ??
    "Sorry, could not generate pitch deck."
  );
}
