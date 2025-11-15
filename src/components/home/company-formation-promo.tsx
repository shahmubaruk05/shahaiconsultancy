"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CompanyFormationPromo() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-xs tracking-[0.25em] text-primary font-semibold mb-2 uppercase">
            Company Formation
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Need a company in Bangladesh?
          </h2>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            Shah Mubaruk helps you register a Private Limited company through RJSC with a clear, 
            transparent breakdown of government fees and service charges. Packages start from{" "}
            <strong>BDT 36,028</strong> for 10 Lakh authorized capital.
          </p>
          <ul className="text-sm text-muted-foreground mb-6 space-y-1">
            <li>• RJSC name clearance, MOA/AOA, filing & digital certificate</li>
            <li>• Detailed cost by authorized capital (10 Lakh to 10 Crore)</li>
            <li>• Guidance on documents, next steps and post-incorporation basics</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
                <Link
                href="/services/company-formation"
                >
                View Company Formation Packages
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link
                href="/contact"
                >
                Book a Free Consultation
                </Link>
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-3">
            Quick Bangladesh examples
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Authorized capital 10 Lakh</span>
              <span className="font-semibold">BDT 36,028</span>
            </li>
            <li className="flex justify-between">
              <span>Authorized capital 40 Lakh</span>
              <span className="font-semibold">BDT 43,763</span>
            </li>
            <li className="flex justify-between">
              <span>Authorized capital 1 Crore</span>
              <span className="font-semibold">BDT 72,158</span>
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Full table from 10 Lakh to 10 Crore is available on the Company Formation page.
          </p>
        </div>
      </div>
    </section>
  );
}
