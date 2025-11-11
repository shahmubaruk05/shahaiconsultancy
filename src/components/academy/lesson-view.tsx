'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Send, CheckCircle2, Lock, Sparkles, Bot, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { askShah } from '@/ai/flows/ask-shah';
import { type AcademyModule } from '@/lib/academy-data';

type UserPlan = 'free' | 'pro' | 'premium';

const LessonAskShahBox = ({ lesson }: { lesson: AcademyModule['lessons'][0] }) => {
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
    <Card className="mt-8 bg-secondary">
      <CardHeader>
        <CardTitle className="text-lg">Ask Shah about this lesson</CardTitle>
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

export function LessonView({ module }: { module: AcademyModule }) {
  const { user, firestore, isUserLoading } = useFirebase();
  const [selectedLessonId, setSelectedLessonId] = useState(module.lessons[0].id);
  const [isCompleting, startCompleting] = useTransition();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  const plan = (userData?.plan as UserPlan) || 'free';

  const progressDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/academyProgress`, module.slug) : null, [user, firestore, module.slug]);
  const { data: progressData } = useDoc(progressDocRef);
  const completedIds = progressData?.completedLessonIds || [];

  const handleMarkAsComplete = (lessonId: string) => {
    if (!user || !progressDocRef) return;
    startCompleting(async () => {
      await setDoc(progressDocRef, {
        completedLessonIds: arrayUnion(lessonId),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
  };

  const hasAccess = module.access === 'free' || plan === 'pro' || plan === 'premium';
  const currentLesson = module.lessons.find(l => l.id === selectedLessonId)!;

  const progressPercentage = (completedIds.length / module.lessons.length) * 100;

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
     )
  }

  if (!hasAccess) {
    return (
      <div className="container py-12 text-center max-w-2xl">
        <Card className="p-8">
            <CardHeader>
                <Lock className="h-12 w-12 mx-auto text-primary" />
                <CardTitle className="mt-4 text-2xl">Pro Content</CardTitle>
                <CardDescription>
                This module is available for Pro & Premium members. Upgrade your plan to unlock all Startup Academy lessons.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/pricing">Upgrade Plan</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{module.title}</h1>
        <p className="text-muted-foreground mt-2">{module.description}</p>
        <div className="mt-4">
            <Progress value={progressPercentage} className="w-full h-2" />
            <p className="text-xs text-muted-foreground mt-1">{completedIds.length} of {module.lessons.length} lessons completed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="sticky top-20">
          <h2 className="text-lg font-semibold mb-2">Lessons</h2>
          <div className="flex flex-col gap-2">
            {module.lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`text-left p-3 rounded-md transition-colors text-sm ${selectedLessonId === lesson.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary'}`}
              >
                <div className="flex items-center justify-between">
                    <span>{lesson.title}</span>
                    {completedIds.includes(lesson.id) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
              <CardDescription>{currentLesson.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentLesson.audioUrl && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Listen to this lesson:</p>
                  <audio controls className="w-full">
                    <source src={currentLesson.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <h3 className="font-semibold mb-2">Transcript</h3>
              <ScrollArea className="h-72 rounded-md border p-4 bg-background">
                <p className="whitespace-pre-wrap text-muted-foreground">{currentLesson.transcript}</p>
              </ScrollArea>
              <div className="mt-6">
                <Button onClick={() => handleMarkAsComplete(currentLesson.id)} disabled={isCompleting || completedIds.includes(currentLesson.id)}>
                  {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {completedIds.includes(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <LessonAskShahBox lesson={currentLesson} />
        </main>
      </div>
    </div>
  );
}
