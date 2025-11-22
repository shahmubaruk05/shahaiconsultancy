import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import AskShahFloatingWidget from "@/components/AskShahFloatingWidget";
import { getOrCreateConversation } from "./tools/ask-shah/actions";

export const metadata: Metadata = {
  title: 'Shah Mubaruk – Your Startup Coach',
  description: 'Turn Your Idea Into an Investment-Ready Business.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    let conversationInfo: { mode: "guest" | "user"; conversationId: string | null } | null = null;

    try {
      conversationInfo = await getOrCreateConversation();
    } catch (e) {
      console.error("Failed to load Ask Shah conversation info in RootLayout:", e);
    }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
        
        {/* Global Ask Shah floating widget, visible on all pages */}
        {conversationInfo && (
            <AskShahFloatingWidget
              initialMode={conversationInfo.mode}
              initialConversationId={conversationInfo.conversationId}
            />
          )}
      </body>
    </html>
  );
}
