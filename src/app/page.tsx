import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { QuickLinks } from "@/components/dashboard/quick-links";
import { CompanyFormationPromo } from "@/components/home/company-formation-promo";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-background">
        <div className="container mx-auto flex flex-col items-center justify-center space-y-6 px-4 py-16 text-center md:py-24 lg:py-32">
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Turn Your Idea Into an Investment-Ready Business.
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Smart AI tools + expert startup coaching by Shah Mubaruk to help you plan, launch, and grow your dream business.
          </p>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild size="lg">
              <Link href="/signup">Start Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tools">Explore AI Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      <CompanyFormationPromo />

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A simple, three-step process to transform your vision into a viable business.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">1</div>
              <h3 className="text-2xl font-bold">Validate</h3>
              <p className="text-muted-foreground">
                Use our AI Startup Validator to test your idea against market trends and get instant feedback.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">2</div>
              <h3 className="text-2xl font-bold">Build</h3>
              <p className="text-muted-foreground">
                Generate a full business plan, company profile, and pitch deck with our suite of AI tools.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">3</div>
              <h3 className="text-2xl font-bold">Fund</h3>
              <p className="text-muted-foreground">
                Go to investors with confidence using professional, data-driven documents and clear strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Tools Grid */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-12">Your AI-Powered Startup Toolkit</h2>
          <QuickLinks />
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Why Choose Shah Mubaruk?</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Benefit from real-world experience. I've founded multiple companies, raised funding, and helped over 300 startups navigate their journey from idea to exit.
            </p>
            <ul className="grid gap-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Real experience from a multi-time founder.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Expertise in funding, from angels to VCs.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>A curriculum proven with 300+ coached companies.</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
              <img
                src="https://picsum.photos/seed/coach-portrait/550/550"
                alt="Shah Mubaruk"
                className="overflow-hidden rounded-full object-cover"
                width={400}
                height={400}
                data-ai-hint="man portrait"
              />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Start your startup journey today.</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4 mb-8">
            Get access to all the AI tools and resources you need to succeed.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Start for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
