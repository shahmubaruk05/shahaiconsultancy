'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, User, Bot, Loader2, Download, Printer } from 'lucide-react';
import { Card } from '../ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, getDocs, doc, setDoc, limit } from 'firebase/firestore';
import Link from 'next/link';
import { askShah } from '@/ai/flows/ask-shah';
import { exportToDocx, exportToPdf } from '@/lib/export';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type FirestoreMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: any;
}

function buildCoachingNoteHtml(messages: Message[]): string {
    let html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #111827; line-height: 1.6; }
            h1 { font-size: 24px; margin-bottom: 8px; color: #1E3A8A; }
            .meta { font-size: 12px; color: #6B7280; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
            .message { margin-bottom: 16px; }
            .role-user { font-weight: 600; color: #1E3A8A; margin-bottom: 4px; }
            .role-assistant { font-weight: 600; color: #008C9E; margin-bottom: 4px; }
            .content { margin-top: 4px; white-space: pre-wrap; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6; }
            footer { margin-top: 32px; font-size: 11px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 8px; }
          </style>
        </head>
        <body>
          <h1>Ask Shah: Coaching Note</h1>
          <div class="meta">
            Generated from Ask Shah – Your Startup Coach assistant.<br/>
            Date: ${new Date().toLocaleDateString()}
          </div>
    `;
  
    // Skip the initial greeting message from the export
    messages.slice(1).forEach((msg) => {
      const label = msg.role === "user" ? "Founder" : "Shah (AI Coach)";
      const roleClass = msg.role === "user" ? "role-user" : "role-assistant";
      html += `
        <div class="message">
          <div class="${roleClass}">${label}</div>
          <div class="content">${msg.content}</div>
        </div>
      `;
    });
  
    html += `
          <footer>
            Coaching note generated with Shah Mubaruk – Your Startup Coach.
          </footer>
        </body>
      </html>
    `;
  
    return html;
}

export function AskShahChat() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
      { role: 'assistant', content: 'Hello! I am Shah, your AI startup advisor. How can I help you today?' },
  ]);
  const [queryText, setQueryText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // Find or create conversation
  useEffect(() => {
    if (user && firestore) {
      const convosRef = collection(firestore, 'users', user.uid, 'conversations');
      const q = query(convosRef, orderBy('createdAt', 'desc'), limit(1));
      
      getDocs(q).then(snapshot => {
        if (snapshot.empty) {
          addDoc(convosRef, {
            userId: user.uid,
            title: 'Ask Shah – Default Conversation',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }).then(docRef => {
            setConversationId(docRef.id);
          });
        } else {
          setConversationId(snapshot.docs[0].id);
        }
      });
    }
  }, [user, firestore]);

  // Listen for new messages
  const messagesQuery = useMemoFirebase(() => 
    conversationId && firestore && user
      ? query(collection(firestore, 'users', user.uid, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'))
      : null,
    [firestore, conversationId, user]
  );
  const { data: firestoreMessages, isLoading: messagesLoading } = useCollection<FirestoreMessage>(messagesQuery);
  
  useEffect(() => {
    if (firestoreMessages) {
        const newMessages: Message[] = firestoreMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
        if (newMessages.length > 0) {
          setMessages([
              { role: 'assistant', content: 'Hello! I am Shah, your AI startup advisor. How can I help you today?' },
              ...newMessages
          ]);
        } else {
            setMessages([{ role: 'assistant', content: 'Hello! I am Shah, your AI startup advisor. How can I help you today?' }])
        }
    }
  }, [firestoreMessages]);


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationId || !user || !firestore || !queryText) return;
    
    const currentQuery = queryText;
    setQueryText('');
    
    const userMessageForUI: Message = { role: 'user', content: currentQuery };
    const currentMessages = [...messages, userMessageForUI];
    setMessages(currentMessages);

    startTransition(async () => {
      try {
        const messagesCol = collection(firestore, `users/${user.uid}/conversations/${conversationId}/messages`);
        
        await addDoc(messagesCol, {
          conversationId,
          userId: user.uid,
          sender: 'user',
          text: currentQuery,
          createdAt: serverTimestamp(),
        });

        const apiHistory = currentMessages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .slice(1)
          .map(m => ({
            role: m.role,
            content: m.content,
          }));

        const response = await askShah({
            query: currentQuery,
            conversationHistory: apiHistory,
            userName: user.displayName,
        });

        const aiText = response.answer ?? "Sorry, I could not generate a reply.";

        await addDoc(messagesCol, {
          conversationId,
          userId: user.uid,
          sender: 'ai',
          text: aiText,
          createdAt: serverTimestamp(),
        });
        
        const convoDocRef = doc(firestore, `users/${user.uid}/conversations`, conversationId);
        await setDoc(convoDocRef, { updatedAt: serverTimestamp() }, { merge: true });

      } catch (error) {
        console.error('Error in chat action:', error);
        const errorMessage: Message = { role: 'assistant', content: 'There was an error processing your request. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isPending]);

  if (isUserLoading) {
    return <Card className="flex flex-col flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></Card>;
  }

  if (!user) {
    return (
      <Card className="flex flex-col flex-1 items-center justify-center text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
        <p className="text-muted-foreground mb-4">You need to be logged in to chat with Shah.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col flex-1 h-full">
      <ScrollArea className="flex-1 p-4 min-h-[220px] max-h-[420px] overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <Input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            autoComplete="off"
            placeholder="Ask about funding, strategy, etc..."
            disabled={isPending || messagesLoading || !conversationId}
          />
          <Button type="submit" size="icon" disabled={isPending || messagesLoading || !conversationId || !queryText}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
