import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACADEMY_MODULES } from "@/lib/academy-data";

export default function AcademyPage() {
  const modules = Object.values(ACADEMY_MODULES);

  return (
    <div className="container py-12 md:py-16">
      <section className="text-center mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Startup Academy
        </h1>
        <p className="max-w-3xl mx-auto mt-4 text-muted-foreground md:text-xl">
         Learn step-by-step how to build, register, and fund your startup with short AI-powered lessons by Shah Mubaruk.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/academy/startup-foundation"
            className="group"
          >
            <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">Startup Foundation 101</CardTitle>
                         <Badge variant="secondary">
                            Free Demo
                        </Badge>
                    </div>
                    <CardDescription>Understand idea validation, problem-solution fit, and early execution.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <span className="text-sm font-semibold text-primary group-hover:underline">
                        Start Learning <ArrowRight className="inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </CardFooter>
            </Card>
          </Link>
          <Link
            href="/academy/company-formation"
            className="group"
          >
            <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">Company Formation (BD & USA)</CardTitle>
                         <Badge variant="default">
                            Pro
                        </Badge>
                    </div>
                    <CardDescription>Step-by-step guidance on choosing structure, registering, and staying compliant in BD & USA.</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <span className="text-sm font-semibold text-primary group-hover:underline">
                        Start Learning <ArrowRight className="inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </CardFooter>
            </Card>
          </Link>
      </div>
    </div>
  );
}
