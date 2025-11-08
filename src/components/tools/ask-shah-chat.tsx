
'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { askShah } from '@/ai/flows/ask-shah';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

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

export function AskShahChat() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
      { role: 'assistant', content: 'Hello! I am Shah, your AI startup advisor. How can I help you today?' },
  ]);
  const [queryText, setQueryText] = useState('');
  const [isPending, startTransition] = useTransition();

  // Find or create conversation
  useEffect(() => {
    if (user && firestore) {
      const convosRef = collection(firestore, 'users', user.uid, 'conversations');
      const q = query(convosRef, limit(1));
      
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
        }
    }
  }, [firestoreMessages]);


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationId || !user || !firestore || !queryText) return;
    
    const currentQuery = queryText;
    setQueryText('');

    startTransition(async () => {
      try {
        const messagesCol = collection(firestore, `users/${user.uid}/conversations/${conversationId}/messages`);
        
        // 1. Save user message
        const userMessageRef = doc(messagesCol);
        const userMessage = {
          id: userMessageRef.id,
          conversationId,
          sender: 'user',
          text: currentQuery,
          createdAt: serverTimestamp(),
        };
        await setDoc(userMessageRef, userMessage);

        // 2. Fetch conversation history for context
        const messagesSnapshot = await getDocs(messagesCol);
        const conversationHistory: Message[] = messagesSnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    role: data.sender === 'ai' ? 'assistant' : 'user',
                    content: data.text,
                };
            });

        // 3. Generate AI reply
        const aiReply = await askShah({ query: currentQuery, conversationHistory });

        // 4. Save AI reply
        const aiMessageRef = doc(messagesCol);
        const aiMessage = {
          id: aiMessageRef.id,
          conversationId,
          sender: 'ai',
          text: aiReply.answer,
          createdAt: serverTimestamp(),
        };
        await setDoc(aiMessageRef, aiMessage);
        
        // 5. Update conversation timestamp
        const convoDocRef = doc(firestore, `users/${user.uid}/conversations`, conversationId);
        await setDoc(convoDocRef, { updatedAt: serverTimestamp() }, { merge: true });

      } catch (error) {
        console.error('Error in chat action:', error);
        // Optionally, set an error state to show in the UI
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
    <Card className="flex flex-col flex-1">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                  'max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm',
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
