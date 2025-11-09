import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Youtube } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="container py-12 md:py-24">
            <div className="grid gap-10 md:grid-cols-2 lg:gap-16 items-center">
                <div className="flex justify-center">
                    <img
                        src="https://picsum.photos/seed/about-portrait/500/500"
                        alt="Shah Mubaruk"
                        className="rounded-full object-cover w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] border-4 border-primary/20 shadow-lg"
                        data-ai-hint="man portrait"
                    />
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-primary font-semibold">Your Startup Coach</p>
                        <h1 className="text-4xl font-bold tracking-tight font-headline">Shah Mubaruk</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        I am a business consultant, serial entrepreneur, and passionate startup mentor. Having founded companies like TabEdge, TabStartup, Adspire, and Tabseer Shop, I have firsthand experience in building businesses from the ground up, raising capital, and navigating the complexities of the startup ecosystem.
                    </p>
                     <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-xl">Mission</h3>
                            <p className="text-muted-foreground">To empower 1 million entrepreneurs with the knowledge, tools, and confidence to turn their ideas into successful, impactful businesses.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-xl">Vision</h3>
                            <p className="text-muted-foreground">To help build a global AI-powered startup ecosystem that fosters innovation and creates opportunities for founders everywhere.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="#" target="_blank"><Linkedin /></Link>
                        </Button>
                         <Button asChild variant="outline" size="icon">
                            <Link href="#" target="_blank"><Facebook /></Link>
                        </Button>
                         <Button asChild variant="outline" size="icon">
                            <Link href="#" target="_blank"><Youtube /></Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
