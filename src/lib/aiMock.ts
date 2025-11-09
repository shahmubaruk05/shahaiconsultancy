
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

export async function generateAskShahReplyMock(
  input: AskShahInput
): Promise<{ answer: string }> {
  // TODO: later replace with real AI API (OpenAI/Gemini).
  return {
    answer: "এটি একটি ডেমো উত্তর, যেখানে আমি Shah Mubaruk – Your Startup Coach হিসেবে " +
      "আপনার স্টার্টআপ, ফান্ডিং, লাইসেন্সিং ও বিজনেস স্ট্র্যাটেজি বিষয়ে সাধারণ দিকনির্দেশনা দিচ্ছি। " +
      "রিয়াল অ্যাপে এখানে আসল AI যুক্ত হবে। আপনার বর্তমান প্রশ্ন ছিল: " +
      input.query
  };
}


export type CompanyProfileInput = {
  companyName: string;
  industry: string;
  country: string;
  targetCustomers: string;
  servicesOrProducts: string;
  brandTone: "Formal" | "Friendly" | "Mixed";
  language: "English" | "Bangla";
};

export type CompanyProfileResult = {
  about: string;
  mission: string;
  vision: string;
  servicesSummary: string;
  targetCustomersSection: string;
  whyChooseUs: string;
  callToAction: string;
};

export async function generateCompanyProfileMock(
  input: CompanyProfileInput
): Promise<CompanyProfileResult> {
  // TODO: later replace with real AI API (OpenAI / Gemini).
  const isBangla = input.language === "Bangla";

  if (isBangla) {
    return {
      about:
        `${input.companyName} হচ্ছে একটি ${input.industry} ভিত্তিক প্রতিষ্ঠান, ` +
        `যা ${input.country} থেকে পরিচালিত হয়ে ${input.targetCustomers} এর জন্য ` +
        `বিশ্বস্ত ও প্রফেশনাল সেবা প্রদান করে। আমরা বাস্তব সমস্যাকে বুঝে, সেই অনুযায়ী ` +
        `প্র্যাকটিক্যাল সমাধান দিতে বিশ্বাসী।`,
      mission:
        "আমাদের মিশন হলো উদ্যোক্তা ও ব্যবসাগুলোকে সঠিক গাইডলাইন, মানসম্মত সেবা এবং দীর্ঘমেয়াদী ভ্যালু দিয়ে টেকসই সফলতা অর্জনে সাহায্য করা।",
      vision:
        "বাংলাদেশ ও গ্লোবাল মার্কেটে একটি ট্রাস্টেড ব্র্যান্ড হিসেবে প্রতিষ্ঠিত হয়ে, আরও বেশি উদ্যোক্তা ও ব্যবসা প্রতিষ্ঠানের গ্রোথ পার্টনার হওয়া।",
      servicesSummary:
        `আমরা মূলত ${input.servicesOrProducts} এই সেবা/প্রডাক্টগুলোকে কেন্দ্র করে কাজ করি, ` +
        `যেখানে ক্লায়েন্টদের নির্দিষ্ট প্রয়োজন অনুযায়ী কাস্টমাইজড সল্যুশন দেওয়া হয়।`,
      targetCustomersSection:
        `আমাদের প্রধান গ্রাহকরা হল ${input.targetCustomers} – যারা প্রফেশনাল সেবা, ` +
        `বিশ্বাসযোগ্যতা এবং দীর্ঘমেয়াদী বিজনেস রিলেশনশিপকে গুরুত্ব দেন।`,
      whyChooseUs:
        "• প্র্যাকটিক্যাল এক্সপেরিয়েন্স ও ইন্ডাস্ট্রি নলেজ\n" +
        "• স্টেপ–বাই–স্টেপ গাইডলাইন ও সাপোর্ট\n" +
        "• ক্লায়েন্ট–ফোকাসড সার্ভিস ও কাস্টম সল্যুশন\n" +
        "• লং–টার্ম পার্টনারশিপ ও গ্রোথ–মাইন্ডসেট",
      callToAction:
        "আপনি যদি আপনার ব্যবসাকে পরের ধাপে নিয়ে যেতে চান, আমাদের সঙ্গে কথা বলুন এবং আপনার প্রয়োজন অনুযায়ী সল্যুশন জেনে নিন।",
    };
  }

  // English default
  return {
    about:
      `${input.companyName} is a ${input.industry} focused company based in ${input.country}, ` +
      `serving ${input.targetCustomers} with practical, execution-driven solutions. We focus on ` +
      `real business problems and clear, measurable outcomes.`,
    mission:
      "Our mission is to help entrepreneurs and businesses grow through clear strategy, reliable services, and long-term value.",
    vision:
      "To be a trusted growth partner for founders and businesses in Bangladesh and around the world.",
    servicesSummary:
      `Our core offerings include ${input.servicesOrProducts}, tailored to the specific needs of each client.`,
    targetCustomersSection:
      `We primarily serve ${input.targetCustomers}, who value professional support, clarity, and sustainable growth.`,
    whyChooseUs:
      "• Practical, real-world experience\n" +
      "• Step-by-step guidance and support\n" +
      "• Client-focused, customized solutions\n" +
      "• Long-term partnership mindset",
    callToAction:
      "If you’re ready to take your business to the next level, reach out and let’s discuss the right solution for you.",
  };
}

    