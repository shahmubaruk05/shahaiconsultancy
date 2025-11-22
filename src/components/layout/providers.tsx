'use client';

import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "./app-layout";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AppLayout>
                {children}
            </AppLayout>
            <Toaster />
        </FirebaseClientProvider>
    );
}
