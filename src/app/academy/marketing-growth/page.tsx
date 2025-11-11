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
    id: "traction",
    title: "Understanding Startup Marketing & Traction",
    summary:
      "Learn what startup marketing really means and how to define traction beyond likes or followers.",
    transcript: `Marketing মানে শুধু ads না — এটা startup-এর **communication system**।

**Growth vs Brand Marketing:**
• Growth Marketing = data-driven (engagement, conversion, retention)
• Brand Marketing = emotion-driven (trust, credibility)

**AARRR Framework (Pirate Metrics):**
1️⃣ Acquisition → কীভাবে customer আনবে
2️⃣ Activation → প্রথম positive experience
3️⃣ Retention → repeat usage
4️⃣ Revenue → monetization
5️⃣ Referral → word of mouth

**Bangladesh Context:**
Facebook, WhatsApp, and local communities = 70% of engagement base.

💡 Shah’s Note:
“Traction is not likes — it’s user behavior change.”`,
  },
  {
    id: "foundation",
    title: "Building a Marketing Foundation for Startups",
    summary:
      "Set your brand foundation: audience, positioning, and value proposition.",
    transcript: `**Step 1:** Define your Ideal Customer Profile (ICP)
→ Who they are, where they spend time, what pain they feel.

**Step 2:** Positioning Map তৈরি করো
→ Example: Price vs Value matrix (low-cost / premium / niche).

**Step 3:** Write your UVP (Unique Value Proposition)
Formula → “I help [WHO] achieve [RESULT] through [DIFFERENCE].”

**Examples:**
• TabEdge → “Cross-border payments for Bangladeshi founders.”
• Adspire → “AI-powered marketing execution for SMEs.”

💬 Shah’s Tip:
“Clarity beats creativity when you’re early-stage.”`,
  },
  {
    id: "acquisition",
    title: "Acquisition & Retention Strategy",
    summary:
      "Develop a customer acquisition funnel and learn to keep users engaged long-term.",
    transcript: `**Acquisition Channels:**
• Organic: SEO, content marketing, LinkedIn posts, community building
• Paid: Facebook Ads, Google Ads, Influencer Marketing

**Funnel Stages:**
Awareness → Consideration → Conversion → Retention

**Retention Tactics:**
• Weekly email / WhatsApp value update
• Facebook community / private group
• Loyalty discounts / referral programs

**AI Tools:**
• ChatGPT / Adspire → Ad copy & campaign idea
• HubSpot / Sender → Email automation
• Notion / Trello → Content calendar

💡 “Acquire smart, retain smarter.”`,
  },
  {
    id: "analytics",
    title: "Analytics & Growth Experiments",
    summary:
      "Measure your growth and test new ideas with analytics and A/B testing.",
    transcript: `**Growth = Continuous Experimentation**

**Metrics to track:**
• CAC (Customer Acquisition Cost)
• LTV (Lifetime Value)
• Conversion Rate (CR)
• Retention Rate

**Tools:**
Google Analytics 4, Meta Ads Manager, Hotjar, Amplitude

**Example Experiment:**
Landing page headline পরিবর্তন করো → CTR তিনদিন ট্র্যাক করো → যা ভালো perform করে সেটা scale করো।

**Feedback Loop Formula:**
Idea → Test → Measure → Learn → Scale

💬 Shah’s Advice:
“Growth is not a department — it’s a mindset.”`,
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


export default function MarketingGrowthPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [plan, setPlan] = useState<PlanType>("free");
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [loading, setLoading] = useState(true);

  const progressDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/academyProgress/marketing-growth`) : null, [user, firestore]);
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
      <h1 className="text-3xl font-bold font-headline mb-2">Marketing & Early Growth</h1>
      <p className="text-muted-foreground mb-6">Learn how to create a sustainable marketing engine for your startup with proven frameworks and AI-driven tactics.</p>

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
