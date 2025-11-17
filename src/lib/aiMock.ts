
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
  about: string;
  mission: string;
  vision: string;
  servicesSummary: string;
  targetCustomersSection: string;
  whyChooseUs: string;
  callToAction: string;
  socialImpact?: string;
};

export async function generateCompanyProfileMock(input: CompanyProfileInput): Promise<CompanyProfileResult> {
  const { companyName, industry, country, targetCustomers, servicesOrProducts, brandTone, language, foundedYear, keyStrengths, sustainability, depth = 'quick' } = input;

  const tone = brandTone === "Friendly" ? "friendly and inspiring" : brandTone === "Mixed" ? "balanced professional yet human" : "formal and polished";

  // Choose template based on industry
  let about = "";
  let mission = "";
  let vision = "";
  let servicesSummary = "";
  let whyChooseUs = "";
  let callToAction = "";
  let socialImpact = "";

  const brandHeader = `Shah Mubaruk – Your Startup Coach`;
  
  let systemPrompt = "";

  switch (depth) {
    case "detailed":
        systemPrompt = "You are a senior corporate copywriter. Write a detailed 2–3 page company profile in markdown with clear headings, short paragraphs, and bullet points. Include: Overview, Mission, Vision, Products & Services, Target Customers, Market Positioning, Team & Governance, Sustainability / Social Impact (if relevant), and Contact Details. Tone: polished and business-oriented.";
        break;
    case "investor":
        systemPrompt = "You are an investor-facing corporate writer. Write a 3–5 page investor-ready company profile in markdown with structured sections, short paragraphs, and bullet points. Include: Executive Overview, Problem & Opportunity, Company Overview, Products & Services, Target Customers & Market, Competitive Advantage, Traction & Key Metrics (use reasonable examples if not provided), Team & Governance, Risks & Mitigation (high level), and Contact / Next Steps. Tone: formal, concise, and suitable for sharing with investors.";
        break;
    default: // quick
        systemPrompt = "You are a professional business writer. Write a 1-page company profile in clear, simple language. Use short paragraphs and 4–6 sections max. Tone: friendly but professional.";
  }


  // This is a mock implementation. A real implementation would use an AI model with the system prompt.
  // For now, we'll just generate content based on the old logic and add a note about the prompt.
  // The structure of the returned object will depend on the expected output for the selected depth.
  // For simplicity, we stick to the existing `CompanyProfileResult` type.

  switch (industry.toLowerCase()) {
    case "agro":
    case "agriculture":
      about = `${companyName} is an ${industry}-focused organization based in ${country}, connecting farmers and consumers through a transparent and efficient supply chain. Founded in ${foundedYear || "recent years"}, it helps both producers and customers access fair prices and reliable quality.`;
      mission = `To empower farmers and deliver fresh, safe food to consumers by modernizing Bangladesh’s agro distribution system.`;
      vision = `To become the most trusted ${industry} network in South Asia, improving farmer income and ensuring food security.`;
      servicesSummary = `We provide farm-to-table delivery, produce collection, quality control, and logistics solutions. Our services ensure traceability, freshness, and fair pricing.`;
      whyChooseUs = `• Direct sourcing from farmers\n• Fair pricing model\n• Food safety & quality focus\n• Transparent operations\n• Social impact-driven`;
      socialImpact = `By reducing middlemen and waste, ${companyName} helps improve farmer livelihoods and promote sustainable agriculture.`;
      break;

    case "technology":
    case "it":
    case "software":
      about = `${companyName} is a ${industry}-driven startup from ${country}, specializing in software development, digital transformation, and automation. Founded in ${foundedYear || "recent years"}, it focuses on helping SMEs and enterprises build scalable, secure, and efficient solutions.`;
      mission = `To empower businesses through modern technology and data-driven decision-making.`;
      vision = `To become a global tech partner from Bangladesh, delivering innovation that transforms industries.`;
      servicesSummary = `We develop custom software, SaaS products, and integration services. Our expertise includes web apps, AI automation, and cloud infrastructure.`;
      whyChooseUs = `• Experienced development team\n• Scalable architecture mindset\n• Transparent communication\n• End-to-end digital support`;
      socialImpact = `${companyName} trains young developers and promotes tech entrepreneurship within ${country}.`;
      break;

    case "education":
      about = `${companyName} is an ${industry}-focused organization from ${country}, providing modern learning experiences and skill development solutions.`;
      mission = `To make quality education accessible, affordable, and outcome-based for all learners.`;
      vision = `To become Bangladesh’s most impactful education platform through innovation and mentorship.`;
      servicesSummary = `We offer online and offline courses, workshops, and career mentoring programs.`;
      whyChooseUs = `• Expert trainers and mentors\n• Practical, job-oriented curriculum\n• Hybrid learning models\n• Measurable learning outcomes`;
      socialImpact = `${companyName} bridges the gap between academic education and employability for youth.`;
      break;

    case "health":
    case "medical":
      about = `${companyName} operates in the ${industry} sector of ${country}, focusing on accessible healthcare and preventive wellness.`;
      mission = `To make primary healthcare affordable, technology-enabled, and patient-focused.`;
      vision = `To build a healthier nation by empowering people with timely medical support and awareness.`;
      servicesSummary = `Our offerings include telemedicine, diagnostics, health monitoring, and corporate wellness programs.`;
      whyChooseUs = `• Qualified medical professionals\n• Secure teleconsultation platform\n• Affordable and reliable care\n• Community health programs`;
      socialImpact = `${companyName} supports rural healthcare awareness and preventive initiatives.`;
      break;

    case "fashion":
    case "clothing":
    case "textile":
      about = `${companyName} is a ${industry}-brand from ${country}, blending creative design with sustainable production.`;
      mission = `To redefine Bangladeshi fashion by combining quality, culture, and conscious craftsmanship.`;
      vision = `To be recognized globally as a responsible, trend-forward fashion brand.`;
      servicesSummary = `We design and produce clothing lines, accessories, and lifestyle products with eco-friendly materials.`;
      whyChooseUs = `• Ethical sourcing & fair trade\n• Trend-driven design\n• High-quality materials\n• Sustainability commitment`;
      socialImpact = `${companyName} promotes women empowerment and rural artisan development.`;
      break;

    case "real estate":
      about = `${companyName} is a ${industry}-driven company from ${country}, providing trusted property development and housing solutions.`;
      mission = `To make real estate investment transparent, secure, and value-driven.`;
      vision = `To shape urban landscapes with innovation and integrity.`;
      servicesSummary = `We offer property sales, land development, construction management, and investment consultancy.`;
      whyChooseUs = `• Transparent documentation\n• Legal due diligence\n• Quality construction standards\n• On-time delivery`;
      socialImpact = `${companyName} creates jobs and contributes to sustainable urban growth.`;
      break;

    default:
      about = `${companyName} is a ${industry}-based company in ${country}, focusing on providing reliable and innovative solutions to ${targetCustomers}.`;
      mission = `To deliver measurable impact and sustainable growth through practical strategies and innovation.`;
      vision = `To become a trusted name in ${industry}, known for excellence, integrity, and innovation.`;
      servicesSummary = `We provide ${servicesOrProducts} tailored to meet the needs of ${targetCustomers}.`;
      whyChooseUs = keyStrengths
        ? keyStrengths
        : `• Proven expertise\n• Customer-centric approach\n• Strong team\n• Long-term partnership mindset`;
      socialImpact = sustainability || "";
  }

  // Adjust content based on depth
  if (depth === 'quick') {
    mission = '';
    vision = '';
    socialImpact = '';
  } else if (depth === 'investor') {
    // Add more investor-focused details
    whyChooseUs += `\n• Strong market traction with a clear path to profitability.\n• Scalable business model with high growth potential.`;
  }


  callToAction = `If you are looking for a trusted partner in the ${industry} sector, connect with us today. ${companyName} – powered by ${brandHeader} – is ready to help you grow.`;

  const result: CompanyProfileResult = {
    about,
    mission,
    vision,
    servicesSummary,
    targetCustomersSection: `We primarily serve ${targetCustomers}, offering customized solutions with a ${tone} approach.`,
    whyChooseUs,
    callToAction,
    socialImpact,
  };
  
  if (language === 'Bangla') {
      result.about = "বাংলায় রূপান্তর করা হয়নি";
      result.mission = "বাংলায় রূপান্তর করা হয়নি";
      result.vision = "বাংলায় রূপান্তর করা হয়নি";
      result.servicesSummary = "বাংলায় রূপান্তর করা হয়নি";
      result.targetCustomersSection = "বাংলায় রূপান্তর করা হয়নি";
      result.whyChooseUs = "বাংলায় রূপান্তর করা হয়নি";
      result.callToAction = "বাংলায় রূপান্তর করা হয়নি";
      result.socialImpact = "বাংলায় রূপান্তর করা হয়নি";
  }


  return result;
}


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

    

    