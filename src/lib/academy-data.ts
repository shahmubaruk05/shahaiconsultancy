export type AcademyModule = {
  slug: string;
  title: string;
  description: string;
  access: 'free' | 'pro';
  lessons: {
    id: string;
    title: string;
    summary: string;
    transcript: string;
    audioUrl?: string;
  }[];
};

export const ACADEMY_MODULES: Record<string, AcademyModule> = {
  'startup-foundation': {
    slug: 'startup-foundation',
    title: 'Startup Foundation 101',
    description: 'Understand idea validation, problem-solution fit, and early execution.',
    access: 'free',
    lessons: [
      {
        id: 'intro',
        title: 'What makes a real startup idea?',
        summary: 'Learn the difference between an idea, a problem, and a solution.',
        transcript:
          `Welcome to Startup Foundation 101. In this first lesson, we'll cover the most critical concept: problem-first thinking.
          
Many founders fall in love with their idea, but successful startups fall in love with a problem. A real startup idea isn't just a cool product; it's a solution to a painful, urgent problem for a specific group of people.

Your job is not to invent something out of thin air. Your job is to find a problem that people are already trying to solve, and then build a better solution.

Key takeaways:
- An idea is not a business.
- A solution without a problem is a recipe for failure.
- Start by identifying a painful, frequent, and valuable problem.`,
        audioUrl: '',
      },
      {
        id: 'validation',
        title: 'Validating Your Idea in 7 Days',
        summary: 'A quick guide to validation using conversations, landing pages, and small tests.',
        transcript:
          `How do you know if your idea is any good without spending months building it? You validate it.

Here’s a 7-day validation roadmap:
- Day 1-2: Clearly define your hypothesis. Who has the problem? What is the core pain point? How will you solve it?
- Day 3-5: Talk to at least 10 potential customers. Do not pitch your idea. Instead, ask them about their problems and how they solve them now. Listen more than you talk.
- Day 6-7: Create a simple one-page landing page describing the value proposition. Use a simple call-to-action like "Join the waitlist." Drive a small amount of traffic (e.g., from online communities or friends) and see if anyone signs up.

If you get positive signals, you're on the right track. If not, it's time to pivot or rethink your assumptions.`,
        audioUrl: '',
      },
    ],
  },
  'company-formation': {
    slug: 'company-formation',
    title: 'Company Formation (BD & USA)',
    description: 'Step-by-step guidance on setting up your company legally.',
    access: 'pro',
    lessons: [
      {
        id: 'bd-steps',
        title: 'Company Registration in Bangladesh',
        summary: 'Key steps, documents, and government bodies involved.',
        transcript:
          `Registering a company in Bangladesh involves several key steps, primarily with the Registrar of Joint Stock Companies and Firms (RJSC).

1.  **Name Clearance:** First, you must apply for and get a unique name for your company from the RJSC website.
2.  **Drafting Documents:** Prepare the Memorandum of Association (MoA) and Articles of Association (AoA). These are the constitutional documents of your company.
3.  **Bank Account & Capital:** Open a temporary bank account in the proposed company's name and deposit the initial share capital.
4.  **RJSC Filing:** Submit all documents, including the MoA, AoA, and director information, to the RJSC for incorporation.
5.  **Post-Incorporation:** After receiving the Certificate of Incorporation, you must obtain a Trade License, Tax Identification Number (TIN), and VAT Registration Certificate.

This process can be complex, so it's often wise to consult with a local law or consulting firm.`,
        audioUrl: '',
      },
      {
        id: 'us-delaware',
        title: 'Why Founders Choose Delaware (USA)',
        summary: 'Learn why Delaware C-Corps are the standard for venture-backed startups.',
        transcript: `Many global startups, even those without a physical presence in the US, choose to incorporate in Delaware as a C-Corporation. Here's why:

1.  **Investor-Friendly:** Venture capitalists (VCs) are most familiar and comfortable with the Delaware corporate law structure. It's the gold standard for tech startups seeking funding.
2.  **Legal Framework:** Delaware has a highly developed and predictable body of corporate law, with a specialized court (the Court of Chancery) that handles business disputes.
3.  **Flexibility:** Delaware law provides significant flexibility in structuring the company, its board, and its stock.
4.  **Privacy:** You do not need to disclose the names of the directors and officers on the public formation documents.

While it's more expensive than incorporating in many other places, setting up a Delaware C-Corp from the beginning can save significant legal headaches when you start raising funds from international investors.`,
        audioUrl: '',
      },
    ],
  },
};
