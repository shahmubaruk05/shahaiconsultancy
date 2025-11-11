"use client";

import { useEffect, useState, useTransition } from "react";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import Link from 'next/link';
import { askShah } from '@/ai/flows/ask-shah';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Bot, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

type PlanType = "free" | "pro" | "premium";

const LESSONS = [
  {
    id: "structure",
    title: "Choosing the Right Legal Structure",
    summary:
      "Understand how to pick the right legal form for your business in Bangladesh or the USA.",
    transcript: `একটি startup শুরু করার আগে, সবচেয়ে গুরুত্বপূর্ণ সিদ্ধান্তগুলোর একটি হলো **কোন আইনি কাঠামোতে (legal structure)** চালানো হবে।

**বাংলাদেশে সাধারণ কাঠামো:**
• Sole Proprietorship → ছোট ট্রেড বা সার্ভিস ব্যবসা (কম খরচ, কিন্তু ব্যক্তিগত liability বেশি)
• Partnership → দুই বা ততোধিক মালিক (শেয়ার নির্ধারণ করতে হয়)
• Private Limited Company (Ltd) → সবচেয়ে জনপ্রিয় startup structure; মালিকানা ভাগ করা যায়, বিনিয়োগ আনা যায়

**যুক্তরাষ্ট্রে সাধারণ কাঠামো:**
• Sole Proprietor → ট্যাক্স সহজ, কিন্তু limited growth
• LLC → liability protection + flexible taxation (many startups choose this)
• C-Corporation → বিনিয়োগ গ্রহণ, ESOP, fundraising সুবিধা (Delaware C-Corp খুব জনপ্রিয়)

**Tips:**
- যদি তুমি fundraise করতে চাও → C-Corp / Ltd বেছে নাও
- যদি freelance / consulting করো → Sole Proprietor বা LLC যথেষ্ট

💡 Shah’s Advice:
“Legal structure তোমার vision ও investor expectation অনুযায়ী ঠিক করো, convenience অনুযায়ী নয়।”`,
  },
  {
    id: "bd-registration",
    title: "Company Registration in Bangladesh",
    summary:
      "Learn the step-by-step RJSC registration process with documents and post-setup tasks.",
    transcript: `বাংলাদেশে একটি Private Limited Company রেজিস্টার করার ধাপগুলো হলো —

**Step 1:** RJSC ওয়েবসাইটে গিয়ে *Name Clearance* আবেদন করো
**Step 2:** কমপক্ষে ২ জন শেয়ারহোল্ডার ও পরিচালক তথ্য প্রস্তুত করো (NID, ছবি, ঠিকানা)
**Step 3:** Memorandum of Association (MoA) ও Articles of Association (AoA) ড্রাফট করো
**Step 4:** Bank account খুলে minimum paid-up capital জমা দাও
**Step 5:** RJSC ফর্ম, ফি ও ডকুমেন্ট সাবমিট করো (অনলাইন পেমেন্টসহ)
**Step 6:** Incorporation Certificate collect করো

**Post-registration requirements:**
• Trade License (City Corporation / Pourashava)
• TIN & VAT registration
• Bank Account (company name এ)

**Common mistakes:**
• ভুল company name spelling
• Directors’ NID mismatch
• MoA তে vague business objective লেখা

**Average Time:** ৭–১০ working days  
**Cost Estimate:** ~৳১০,০০০–১৫,০০০

💡 “যদি ভবিষ্যতে বিদেশি বিনিয়োগ আনতে চাও, শুরু থেকেই Pvt Ltd করো।”`,
  },
  {
    id: "usa-formation",
    title: "Company Formation in the USA (for Foreign Founders)",
    summary:
      "Step-by-step guide to setting up a US entity as a foreign founder.",
    transcript: `যুক্তরাষ্ট্রে startup formation বিদেশি উদ্যোক্তাদের জন্যও সহজ হয়েছে।

**Step-by-step Process:**
1️⃣ Choose your state → Delaware (investor-friendly), Wyoming, ইত্যাদি
2️⃣ Decide structure → LLC (simple) বা C-Corp (funding-friendly)
3️⃣ File incorporation → Stripe Atlas, Firstbase, Doola, ইত্যাদি সার্ভিস দিয়ে করা যায়
4️⃣ EIN (Employer Identification Number) নাও → IRS থেকে ট্যাক্স আইডি
5️⃣ ITIN (Individual Taxpayer Identification Number) প্রয়োজন হতে পারে
6️⃣ US Bank Account খুলো → Mercury, Relay, Wise, ইত্যাদি

**Time required:** সাধারণত ৩–৭ business days  
**Cost estimate:** $৩০০–$৬০০ (state ও service অনুযায়ী)

**Pro Tip:**
Global payment বা fundraising plan থাকলে → Delaware C-Corp খুব সুবিধাজনক।

উদাহরণ:
“Tabseer Inc.” বা “TabEdge LLC” — Bangladeshi founders দ্বারা US এ registered entity।

✳️ Shah’s Note:
“USA registration মানে শুধু prestige না, বরং funding compatibility।”`,
  },
  {
    id: "compliance",
    title: "Compliance, Tax & Banking Setup",
    summary:
      "Learn basic compliance and banking hygiene for both Bangladesh and USA.",
    transcript: `company setup করার পর সবচেয়ে গুরুত্বপূর্ণ হলো **compliance & banking hygiene** বজায় রাখা।

**Bangladesh:**
• RJSC Annual Return (Form XV, XXIII) সময়মতো জমা দাও
• TIN & VAT return রেগুলার ফাইল করো
• Trade License annually renew করো

**USA:**
• Annual Franchise Tax (Delaware C-Corp এর জন্য)
• IRS Tax return (Form 1120 / 1065)
• Registered agent বজায় রাখা
• Clean bookkeeping রাখা (QuickBooks, Wave ইত্যাদি)

**Banking:**
• Mercury / Relay / Wise – international founders-friendly
• Verify with: Passport, EIN, Incorporation docs

💡 Pro Advice:
Startup যত ছোটই হোক, **clean books + compliance = investor-ready**।

“Investors prefer clean books more than clever pitch decks.”`,
  },
];

const LessonAskShahBox = ({ lesson }: { lesson: typeof LESSONS[0] }) => {
    const [input, setInput] = useState('');
    const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleAsk = () => {
        if (!input.trim()) return;
        const question = input;
        setInput('');

        startTransition(async () => {
        const { answer } = await askShah({
            query: question,
            conversationHistory: [
            { role: 'user', content: `The user is asking a question about the following lesson:\n\nTitle: ${lesson.title}\n\nTranscript:\n${lesson.transcript}` },
            ],
        });
        setAnswers((prev) => [...prev, { q: question, a: answer }]);
        });
    };

    return (
        <Card className="mt-8 bg-secondary/50">
        <CardHeader>
            <CardTitle className="text-xl">Ask Shah about this lesson</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {answers.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border bg-background p-4">
                <p className="font-semibold text-primary flex items-center gap-2"><User className="h-4 w-4" /> {item.q}</p>
                <p className="text-muted-foreground whitespace-pre-wrap flex items-start gap-2"><Bot className="h-4 w-4 mt-1 flex-shrink-0" /> {item.a}</p>
                </div>
            ))}
            <div className="flex gap-2">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isPending}
                />
                <Button onClick={handleAsk} disabled={isPending || !input.trim()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
            </div>
        </CardContent>
        </Card>
    );
};


export default function CompanyFormationPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [plan, setPlan] = useState<PlanType>("free");
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [loading, setLoading] = useState(true);

  const progressDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/academyProgress/company-formation`) : null, [user, firestore]);
  const { data: progressData, isLoading: isProgressLoading } = useDoc(progressDocRef);
  const completed = progressData?.completedLessonIds || [];

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  
  useEffect(() => {
    if (!isUserLoading && !isUserDataLoading) {
        setPlan((userData?.plan as PlanType) || "free");
        setLoading(false);
    }
  }, [isUserLoading, isUserDataLoading, userData]);
  
  
  const [isCompleting, startCompleting] = useTransition();

  const markComplete = () => {
    if (!user || !progressDocRef) return alert("Login required");
    
    startCompleting(async () => {
        await setDoc(progressDocRef, { 
            completedLessonIds: arrayUnion(lesson.id),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
  };
  
  if (loading || isUserLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const isPro = plan === "pro" || plan === "premium";

  if (!user || !isPro) {
    return (
      <Card className="m-auto mt-12 max-w-lg text-center p-8">
          <CardTitle>Upgrade to Pro</CardTitle>
          <CardDescription className="mt-2 mb-4">
            This module is available for Pro & Premium members. Upgrade your plan to unlock all Startup Academy lessons.
          </CardDescription>
          <Button asChild>
              <Link href="/pricing">Go to Pricing</Link>
          </Button>
      </Card>
    );
  }

  const isCompleted = completed.includes(lesson.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-2">Company Formation (Bangladesh & USA)</h1>
      <p className="text-muted-foreground mb-6">Learn how to choose the right structure, register your company, and stay compliant.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {LESSONS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLesson(l)}
            className={`px-3 py-1 rounded-md border text-sm transition-colors ${
              lesson.id === l.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            {l.title}
            {completed.includes(l.id) && " ✅"}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            <CardDescription>{lesson.summary}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {lesson.transcript}
            </p>
        </CardContent>
      </Card>
      
      <div className='mt-4'>
        <Button onClick={markComplete} disabled={isCompleting || isCompleted}>
            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCompleted ? "Completed ✔" : "Mark as completed"}
        </Button>
      </div>

      <LessonAskShahBox lesson={lesson} />

      <footer className="mt-8 text-xs text-center text-muted-foreground">
        Powered by Shah Mubaruk – Your Startup Coach
      </footer>
    </div>
  );
}