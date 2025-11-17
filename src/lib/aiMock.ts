
'use client';
import { AskShahInput } from "@/ai/flows/ask-shah";
import { GenerateBusinessStrategyInput, GenerateBusinessStrategyOutput } from "@/ai/flows/generate-business-strategy";
import { GeneratePitchDeckOutlineInput, GeneratePitchDeckOutlineOutput } from "@/ai/flows/generate-pitch-deck-outline";
import { ValidateStartupIdeaInput, ValidateStartupIdeaOutput } from "@/ai/flows/validate-startup-idea";


export async function generateBusinessStrategyMock(
  input: GenerateBusinessStrategyInput
): Promise<GenerateBusinessStrategyOutput> {
  // TODO: later replace with real AI API
  return {
    businessStrategy:
      "This is a prototype strategy generated for your business. The focus is on a clear niche, simple monetization, and fast validation. Based on your input, the model is service-first, leveraging your unique selling proposition. The pricing will be tiered to attract different customer segments, and marketing will focus on content and community.",
    ninetyDayActionPlan:
      "Days 1–30: Define a narrow ideal client profile and refine your offers based on the provided USP. Create starter content.\nDays 31–60: Launch simple landing pages for your pricing tiers and start posting educational content 3–4 times per week on LinkedIn and local Facebook groups.\nDays 61–90: Onboard your first 1-3 clients, collect testimonials, create case studies, and experiment with small paid campaigns on your best-performing channel.",
  };
}


export async function validateStartupIdeaMock(
  input: ValidateStartupIdeaInput
): Promise<ValidateStartupIdeaOutput> {
  const score = Math.floor(Math.random() * 35) + 60; // Random score between 60 and 95

  return {
    score,
    summary:
      "The idea shows potential if you can focus on a clear target segment and prove that they are willing to pay. Start with a small, testable version of the product or service.",
    risks: [
      "Key risks include unclear differentiation from existing players.",
      "Difficulty acquiring your first users without a clear marketing strategy.",
      "The time needed to prove traction and secure funding may be longer than anticipated."
    ],
    recommendations: [
      "Talk to at least 10–20 potential customers to validate the real pain point.",
      "Launch a simple Minimum Viable Product (MVP) to test the core assumptions.",
      "Track a few core metrics like number of leads, conversions, and monthly revenue."
    ],
  };
}


export async function generatePitchDeckOutlineMock(
  input: GeneratePitchDeckOutlineInput
): Promise<GeneratePitchDeckOutlineOutput> {
  // TODO: later replace with real AI API
  return [
    {
      slideTitle: "Title Slide",
      slideContentSuggestions: [
          `Company Name: ${input.businessName}`,
          `Tagline: A clear, concise one-liner about your business.`,
          "Your Name & Contact Info"
      ],
    },
    {
      slideTitle: "Problem",
      slideContentSuggestions: [
          "Clearly articulate the pain point you are solving.",
          `Based on your input: "${input.problemStatement}"`,
          "Use statistics or a relatable story."
      ],
    },
    {
      slideTitle: "Solution",
      slideContentSuggestions: [
        "Present your product or service as the clear solution.",
        `Your solution: "${input.solutionStatement}"`,
        "Showcase the top 3 key features or benefits."
      ],
    },
    {
      slideTitle: "Market Opportunity",
      slideContentSuggestions: [
          `Define your market size (TAM, SAM, SOM). You mentioned: "${input.marketSize}"`,
          "Describe your target audience and their characteristics.",
          `Your target audience: "${input.targetAudience}"`
      ],
    },
    {
      slideTitle: "Business Model",
      slideContentSuggestions: [
          `Explain how you make money. You stated: "${input.revenueModel}"`,
          "Detail your pricing strategy.",
          "Talk about customer lifetime value if applicable."
      ],
    },
     {
      slideTitle: "Traction",
      slideContentSuggestions: [
          "Show evidence of validation.",
          input.financialProjections ? `Current financial state: "${input.financialProjections}"` : "Show user growth, revenue, or key partnerships.",
          "Include testimonials or positive feedback if you have any."
      ],
    },
     {
      slideTitle: "Team",
      slideContentSuggestions: [
          "Introduce the core team members.",
          "Highlight relevant experience and expertise.",
          "Explain why your team is the right one to solve this problem."
      ],
    },
    {
      slideTitle: "Funding Request",
      slideContentSuggestions: [
        `State clearly how much you are asking for: "${input.fundingRequirements}"`,
        "Explain how the funds will be used (e.g., product development, marketing, hiring).",
        "Outline your key milestones for the next 12-18 months."
      ],
    },
  ];
}


export type AskShahMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CompanyProfileInput = {
    companyName: string;
    industry: string;
    country: string;
    targetCustomers: string;
    servicesOrProducts: string;
    brandTone: "Formal" | "Friendly" | "Mixed";
    language: "English" | "Bangla";
    companySize: "Startup (1–10)" | "SME (11–50)" | "Growing (51–200)" | "Corporate (200+)";
    foundedYear?: string;
    coreValue?: string;
    marketFocus: "Local" | "Regional" | "International";
    sustainability?: string;
    keyStrengths?: string;
    depth?: "quick" | "detailed" | "investor";
  };

export type CompanyProfileResult = {
  profileMarkdown: string;
};

export type BusinessPlanInput = {
    businessName: string;
    industry: string;
    country: string;
    targetAudience: string;
    problem: string;
    solution: string;
    revenueModel: string;
    fundingNeed: string;
  };

  export type BusinessPlanResult = {
    executiveSummary: string;
    marketAnalysis: string;
    marketingPlan: string;
    operationsPlan: string;
    financialOverview: string;
    nextSteps: string[];
  };

  export async function generateBusinessPlanMock(
    input: BusinessPlanInput
  ): Promise<BusinessPlanResult> {
    // TODO: later replace with a real AI API (OpenAI / Gemini).
    const baseDescription =
      `The business "${input.businessName}" operates in the ${input.industry} sector in ${input.country}. ` +
      `It serves ${input.targetAudience} by solving the problem: ${input.problem}, ` +
      `through the solution: ${input.solution}.`;

    return {
      executiveSummary:
        baseDescription +
        ` The goal is to build a sustainable business using a ${input.revenueModel} model and gradually validate the market before scaling.`,
      marketAnalysis:
        "The target market shows growing interest in practical, outcome-focused solutions. The space is somewhat competitive, but there is room for a niche, founder-friendly offering that speaks the local language and context. Start with a clear niche and validate demand with early adopters.",
      marketingPlan:
        "Focus first on low-cost, high-trust channels: educational content, community groups, referrals, and 1:1 conversations. Use social media (Facebook, LinkedIn, YouTube) to share case studies and simple explainers. Later experiment with small paid campaigns once basic conversion metrics are understood.",
      operationsPlan:
        "Start lean with a small core team or even a solo founder using freelancers/partners where needed. Document simple processes for client onboarding, delivery, and follow-up. Set monthly and quarterly goals so you can track progress and adjust quickly based on feedback.",
      financialOverview:
        `Initial funding need: ${input.fundingNeed || "Bootstrapped / small initial budget"}. ` +
        "Plan for very basic fixed costs in the beginning (tools, legal, minimal team) and focus on early revenue from paying customers. Track unit economics before investing heavily in growth.",
      nextSteps: [
        "Validate problem and solution with at least 10–20 real conversations.",
        "Define a minimum viable offer (MVP) and test it with early customers.",
        "Set up simple tracking for leads, conversions, revenue, and churn.",
        "Refine pricing and packages based on feedback.",
        "Prepare a lightweight pitch deck and financial projection if external funding is needed.",
      ],
    };
  }

    

    

    