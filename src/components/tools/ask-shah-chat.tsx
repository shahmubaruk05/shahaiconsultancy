'use client';

import React, { useState, useRef, useEffect, useActionState, useTransition } from 'react';
import { askShahAction, Message } from '@/app/actions/ask-shah';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  query: z.string().min(1),
});

export function AskShahChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Shah, your AI startup advisor. How can I help you today?',
    },
  ]);

  const [state, formAction] = useActionState(askShahAction, { success: false, messages: [] });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = async (formData: FormData) => {
    const query = formData.get('query') as string;
    if (!query) return;

    setMessages(prev => [...prev, { role: 'user', content: query }]);
    startTransition(() => {
        formAction(formData);
    });
    form.reset();
  };

  useEffect(() => {
    if (state.success && state.answer) {
      setMessages(prev => [...prev, { role: 'assistant', content: state.answer as string }]);
    }
    // Handle error state if needed
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isPending]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
        <form action={handleFormSubmit} className="flex items-center gap-2">
          <input type="hidden" name="conversationHistory" value={JSON.stringify(messages)} />
          <Input
            {...form.register('query')}
            autoComplete="off"
            placeholder="Ask about funding, strategy, etc..."
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
