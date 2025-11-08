import { AskShahChat } from '@/components/tools/ask-shah-chat';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AskShahPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
        <div className='mb-4'>
            <CardTitle className="text-2xl">Ask Shah</CardTitle>
            <CardDescription>
                Your AI-powered chatbot assistant for advice on startups, funding, licensing, tax, strategy, business and marketing.
            </CardDescription>
        </div>
        <AskShahChat />
    </div>
  );
}
