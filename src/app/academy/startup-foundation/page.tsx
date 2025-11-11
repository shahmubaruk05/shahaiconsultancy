'use client';
import { useState, useEffect, useTransition } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { askShah } from '@/ai/flows/ask-shah';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Bot, Send } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const LESSONS = [
  {
    id: 'idea',
    title: 'What Makes a Real Startup Idea?',
    summary: 'Learn how to identify real problems and transform them into scalable startup ideas.',
    transcript: `অনেক উদ্যোক্তা ভাবে — “আমার একটা নতুন আইডিয়া আছে”, কিন্তু সফল startup গড়ে না আইডিয়া দিয়ে, বরং সমস্যা দিয়ে।

একটা ভালো আইডিয়া মানে এমন কিছু যা “কেউ করছে না” নয় — বরং “কেউ এখনো ঠিকভাবে করেনি।”

**3-Step Idea Filter Formula:**
1️⃣ Problem — মানুষ কি এই সমস্যা অনুভব করে?
2️⃣ Frequency — তারা কত বার এটা অনুভব করে?
3️⃣ Willingness to pay — তারা কি সমাধানের জন্য টাকা দিতে রাজি?

উদাহরণ: Pathao, ShopUp, 10 Minute School সবই pain solve করেছে।

👉 Great startup = painful problem × scalable solution.`,
  },
  {
    id: 'validation',
    title: 'Validating Your Idea in 7 Days',
    summary: 'A 7-day roadmap to validate your startup idea without big risk.',
    transcript: `Validation মানে perfect plan নয় — এটা হলো “learn fast, fail cheap” process।

**7-Day Idea Validation Plan:**
• Day 1–2 → Value proposition লিখো  
• Day 3 → Landing page বা Facebook page খুলো  
• Day 4–5 → 10 জন potential user সাথে কথা বলো  
• Day 6 → Small test (ad / poll) চালাও  
• Day 7 → Measure interest & conversion

যখন দেখবে problem আছে এবং মানুষ pay করতে রাজি → তুমি validate করে ফেলেছো।`,
  },
  {
    id: 'mvp',
    title: 'From Idea to MVP',
    summary: 'Learn how to build the simplest version that delivers real value.',
    transcript: `MVP মানে half product না — “the simplest version that delivers value.”

**MVP Pyramid:**
• Core → তোমার product কি solve করে  
• Function → কীভাবে কাজ করে  
• Experience → ইউজার কেমন অনুভব করে

Start simple → refine → expand.

**30-Day MVP Roadmap**
Week 1: Idea Sketch + User Flow  
Week 2: Prototype Build  
Week 3: Beta Launch (10 users)  
Week 4: Feedback & Retention

💡 MVP = proof of commitment, not perfection.`,
  },
  {
    id: 'plan',
    title: 'The 90-Day Action Plan',
    summary: 'Create a structured roadmap for your first 90 days as a founder.',
    transcript: `Startup launch মানে এক দিনে সব কিছু না — ছোট ছোট লক্ষ্য।

**First 90 Days Roadmap:**
📅 Month 1 → Validation + MVP Build  
📅 Month 2 → Early Traction  
📅 Month 3 → Scale & Fundability

Execution beats idea every time.`,
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


export default function StartupFoundationPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [lesson, setLesson] = useState(LESSONS[0]);

  const progressDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/academyProgress`, "startup-foundation") : null, [user, firestore]);
  const { data: progressData } = useDoc(progressDocRef);
  const completed = progressData?.completedLessonIds || [];

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
  
  if (isUserLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="m-auto mt-12 max-w-lg text-center p-8">
          <CardTitle>Please Log In</CardTitle>
          <CardDescription className="mt-2 mb-4">You need to be logged in to access the Academy.</CardDescription>
          <Button asChild>
              <Link href="/login">Log In</Link>
          </Button>
      </Card>
    );
  }

  const isCompleted = completed.includes(lesson.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-2">Startup Foundation 101</h1>
      <p className="text-muted-foreground mb-6">Learn to validate ideas, build MVPs & execute your first 90-day plan.</p>

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

    