
'use client';

export type BusinessStrategyInput = {
  businessModel: string;
  usp: string;
  pricing: string;
  marketingChannels: string;
};

export type BusinessStrategyResult = {
  businessStrategy: string;
  ninetyDayActionPlan: string;
};

export async function generateBusinessStrategyMock(
  input: BusinessStrategyInput
): Promise<BusinessStrategyResult> {
  // TODO: later replace with real AI API
  return {
    businessStrategy:
      "This is a prototype strategy generated for your business. The focus is on a clear niche, simple monetization, and fast validation. Based on your input, the model is service-first, leveraging your unique selling proposition. The pricing will be tiered to attract different customer segments, and marketing will focus on content and community.",
    ninetyDayActionPlan:
      "Days 1–30: Define a narrow ideal client profile and refine your offers based on the provided USP. Create starter content.\nDays 31–60: Launch simple landing pages for your pricing tiers and start posting educational content 3–4 times per week on LinkedIn and local Facebook groups.\nDays 61–90: Onboard your first 1-3 clients, collect testimonials, create case studies, and experiment with small paid campaigns on your best-performing channel.",
  };
}

export type IdeaValidationInput = {
  ideaDescription: string;
};

export type IdeaValidationResult = {
  score: number;
  summary: string;
  risks: string[];
  recommendations: string[];
};

export async function validateStartupIdeaMock(
  input: IdeaValidationInput
): Promise<IdeaValidationResult> {
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

export type PitchDeckSlide = {
  slideTitle: string;
  slideContentSuggestions: string[];
};

export type PitchDeckInput = {
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  problemStatement: string;
  solutionStatement: string;
  uniqueSellingProposition: string;
  valueProposition: string;
  revenueModel: string;
  marketSize: string;
  competitiveLandscape: string;
  financialProjections: string;
  fundingRequirements: string;
};

export async function generatePitchDeckOutlineMock(
  input: PitchDeckInput
): Promise<PitchDeckSlide[]> {
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

export async function generateAskShahReplyMock(
  question: string,
  previousMessages: AskShahMessage[]
): Promise<string> {
  // TODO: later replace with real AI API (OpenAI/Gemini).
  return (
    "এটি একটি ডেমো উত্তর, যেখানে আমি Shah Mubaruk – Your Startup Coach হিসেবে " +
    "আপনার স্টার্টআপ, ফান্ডিং, লাইসেন্সিং ও বিজনেস স্ট্র্যাটেজি বিষয়ে সাধারণ দিকনির্দেশনা দিচ্ছি। " +
    "রিয়াল অ্যাপে এখানে আসল AI যুক্ত হবে। আপনার বর্তমান প্রশ্ন ছিল: " +
    question
  );
}
