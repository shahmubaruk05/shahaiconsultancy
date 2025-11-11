"use client";

import { useEffect, useState, useTransition } from "react";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import Link from 'next/link';
import { askShah } from '@/ai/flows/ask-shah';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Bot, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

type PlanType = "free" | "pro" | "premium";

const LESSONS = [
  {
    id: "stages",
    title: "Understanding Startup Funding Stages",
    summary:
      "Learn the different stages of funding and when it actually makes sense to raise money.",
    transcript: `সব startup এর funding দরকার নয় — profitability বা traction প্রায়ই funding এর চেয়ে বেশি powerful।

কিন্তু যখন fund raise করতে হবে, আগে বুঝতে হবে তুমি কোন stage এ আছো।

**Typical Funding Stages:**
1️⃣ Bootstrapping → নিজের savings / family money
2️⃣ Pre-seed → concept + problem validation (৳২–১০ লক্ষ)
3️⃣ Seed → MVP + early users + team (৳১০–৫০ লক্ষ)
4️⃣ Series A → traction + scalable model (> $১M)
5️⃣ Series B & beyond → growth, expansion, new markets

বাংলাদেশে common sources:
• Angel Investors
• Accelerators & Incubators
• VC funds (Bangladesh Angels, Startup Bangladesh Ltd, IDLC VC, ইত্যাদি)

💡 Key idea:
Investors don’t fund ideas, they fund **execution + team + traction**.`,
  },
  {
    id: "pitch-deck",
    title: "How to Build an Investor-Ready Pitch Deck",
    summary:
      "Follow a clear 10-slide structure and learn how to tell your startup story to investors.",
    transcript: `Pitch deck মানে শুধু PowerPoint না — এটা একটা **storytelling document** যা investor কে বিশ্বাস করায় যে তুমি execution-ready।

**Standard 10-Slide Pitch Deck:**
1️⃣ Problem
2️⃣ Solution / Product
3️⃣ Market Size (TAM, SAM, SOM)
4️⃣ Business Model
5️⃣ Traction & Milestones
6️⃣ Competition & USP
7️⃣ Team
8️⃣ Financial Projection (summary)
9️⃣ Funding Ask & Use of Funds
🔟 Vision / Impact

**Design Tips:**
• 1 slide = 1 message
• কম text, বেশি visual
• মোট slide ideally 10–12 এর মধ্যে

**Storytelling Formula – “3A”:**
• Attention → একটি strong opening (problem + traction)
• Action → তুমি কী বানিয়েছো, কীভাবে কাজ করে
• Ask → কত fund দরকার, কোথায় use করবে

Shah’s Advice:
“Investors remember clarity more than creativity.”`,
  },
  {
    id: "financials",
    title: "Financial Projection & Valuation Basics",
    summary:
      "Understand a simple 3-year projection and what investors look for in your numbers.",
    transcript: `Financial projection মানে future guess না — এটা হলো **সংগঠিত assumptions + logic**।

**Simple 3-Year Projection:**
• Revenue → কতজন customer × average price
• COGS → product ডেলিভারির direct cost
• Operating Expenses → salary, rent, marketing, tech
• Profit / Loss → Revenue - Total Cost

**Key Metrics:**
• Burn Rate → মাসে কত cash burn হচ্ছে
• Runway → হাতে থাকা cash দিয়ে কয় মাস টিকে থাকবে
• CAC (Customer Acquisition Cost)
• LTV (Lifetime Value)

**Valuation Basics (very high level):**
1️⃣ Comparable Method → similar startup / industry multiple
2️⃣ Revenue Multiple → 2x–5x of annual revenue (early stage)
3️⃣ Negotiation → investor appetite, founder strength

💡 মনে রাখো:
Valuation = শুধু maths না, বরং **market + negotiation + timing** এর mix।`,
  },
  {
    id: "pitching",
    title: "How to Pitch & Communicate with Investors",
    summary:
      "Learn how to behave in meetings, answer questions, and follow up like a professional founder.",
    transcript: `Investor meeting মানে exam না — এটা একটি partnership conversation।

**Pre-Pitch Checklist:**
• তোমার numbers মুখস্থ জানো (revenue, burn, runway)
• Investor এর portfolio দেখে নাও
• ২–৩ মিনিটের sharp summary practice করো

**During Pitch:**
• Start with traction → তারপর problem, তারপর solution
• Honest হও — risk ও challenge শেয়ার করো
• যদি কিছু না জানো, বলো “I will check and get back.”

**Post-Pitch:**
• ২৪ ঘন্টার মধ্যে একটি follow-up email পাঠাও (summary + deck + ask)
• মাসিক update email পাঠাতে থাকো (even যদি তারা now invest না করে)

**Avoid:**
• Fake numbers
• Overpromising (“আমরা ৩ মাসে unicorn হবো” টাইপ কথা)
• স্প্যাম follow-up (দিনে ৩ বার message)

Shah’s Reminder:
“Investors back founders who communicate with clarity and consistency.”`,
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


export default function FundingReadinessPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [plan, setPlan] = useState<PlanType>("free");
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [loading, setLoading] = useState(true);

  const progressDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/academyProgress/funding-readiness`) : null, [user, firestore]);
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
      <h1 className="text-3xl font-bold font-headline mb-2">Funding & Investor Readiness</h1>
      <p className="text-muted-foreground mb-6">Learn to move from idea-stage to investor-ready, with clear funding stages, a strong pitch deck, and confident communication.</p>

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