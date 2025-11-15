
"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { AskShahChat } from '@/components/tools/ask-shah-chat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";


const COST_DATA: Record<string, any> = {
  "10_lakh": {
    label: "10 Lakh",
    govt: {
      registration_fee: 0,
      filing_fee: 1200,
      name_clearance: 600,
      stamp_fee: 12300,
      certified_copy_fee: 1520,
      vat_15_percent: 408,
      total_govt_fees: 16028,
    },
    service_fee: 20000,
    total_cost: 36028,
  },
  "40_lakh": {
    label: "40 Lakh",
    govt: {
      registration_fee: 2400,
      filing_fee: 1200,
      name_clearance: 500,
      stamp_fee: 12300,
      certified_copy_fee: 1520,
      vat_15_percent: 918,
      total_govt_fees: 18763,
    },
    service_fee: 25000,
    total_cost: 43763,
  },
  "1_crore": {
    label: "1 Crore",
    govt: {
      registration_fee: 9700,
      filing_fee: 1200,
      name_clearance: 500,
      stamp_fee: 32300,
      certified_copy_fee: 1520,
      vat_15_percent: 1938,
      total_govt_fees: 47158,
    },
    service_fee: 25000,
    total_cost: 72158,
  },
  "2_crore": {
    label: "2 Crore",
    govt: {
      registration_fee: 22700,
      filing_fee: 1200,
      name_clearance: 500,
      stamp_fee: 32300,
      certified_copy_fee: 1520,
      vat_15_percent: 3888,
      total_govt_fees: 62108,
    },
    service_fee: 25000,
    total_cost: 87108,
  },
  "3_crore": {
    label: "3 Crore",
    govt: {
      registration_fee: 35700,
      filing_fee: 1200,
      name_clearance: 600,
      stamp_fee: 32300,
      certified_copy_fee: 1520,
      vat_15_percent: 5853,
      total_govt_fees: 77173,
    },
    service_fee: 40000,
    total_cost: 117173,
  },
  "4_crore": {
    label: "4 Crore",
    govt: {
      registration_fee: 48700,
      filing_fee: 1200,
      name_clearance: 600,
      stamp_fee: 32300,
      certified_copy_fee: 1520,
      vat_15_percent: 7803,
      total_govt_fees: 92123,
    },
    service_fee: 40000,
    total_cost: 132123,
  },
  "5_crore": {
    label: "5 Crore",
    govt: {
      registration_fee: 61700,
      filing_fee: 1200,
      name_clearance: 0,
      stamp_fee: 32300,
      certified_copy_fee: 1220,
      vat_15_percent: 9618,
      total_govt_fees: 106038,
    },
    service_fee: 40000,
    total_cost: 146038,
  },
  "10_crore": {
    label: "10 Crore",
    govt: {
      registration_fee: 126700,
      filing_fee: 1200,
      name_clearance: 500,
      stamp_fee: 32300,
      certified_copy_fee: 1520,
      vat_15_percent: 24333,
      total_govt_fees: 186553,
    },
    service_fee: 40000,
    total_cost: 226553,
  },
};

// options order for dropdown/buttons
const OPTIONS = [
  "10_lakh",
  "40_lakh",
  "1_crore",
  "2_crore",
  "3_crore",
  "4_crore",
  "5_crore",
  "10_crore",
];

export default function CompanyFormationServicePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedKey, setSelectedKey] = useState<string>("10_lakh");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // form state
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // keep email defaulted if user logs in later
    setName(user?.displayName || name);
    setEmail(user?.email || email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const dataForSelected = COST_DATA[selectedKey];

  function formatBDT(n: number) {
    return n.toLocaleString("en-IN");
  }

  async function handleSubmitInquiry(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);
    if (!name || !email || !phone) {
      setStatusMsg("Please fill name, phone and email.");
      return;
    }
    if (!firestore) {
        setStatusMsg("An error occurred. Please try again later.");
        return;
    }

    setSubmitting(true);
    try {
      const colRef = collection(firestore, "companyFormationInquiries");
      await addDoc(colRef, {
        name,
        email,
        phone,
        message,
        selectedAuthorizedCapital: dataForSelected.label,
        quote: dataForSelected,
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
        status: "new",
      });
      setStatusMsg("Inquiry sent! We will contact you within 24 hours.");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to submit. Try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDownloadQuote() {
    const payload = {
      title: `Company formation quote — ${dataForSelected.label}`,
      generatedAt: new Date().toISOString(),
      quote: dataForSelected,
    };
    const txt = `Shah Mubaruk — Company Formation Quote\n\nAuthorized capital: ${dataForSelected.label}\n\nGovernment Fees:\n` +
      Object.entries(dataForSelected.govt)
        .map(([k, v]) => `- ${k.replace(/_/g, " ")}: BDT ${formatBDT(Number(v))}`)
        .join("\n") +
      `\n\nService fee: BDT ${formatBDT(dataForSelected.service_fee)}\n\nTotal cost: BDT ${formatBDT(dataForSelected.total_cost)}\n\nContact: ${name} / ${email} / ${phone}\n\nPowered by Shah Mubaruk – Your Startup Coach\n`;

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `quote-${selectedKey}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column: main content */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-extrabold mb-2">Company Formation — Bangladesh (RJSC)</h1>
          <p className="text-muted-foreground mb-6">
            Register a Private Limited company through RJSC. Choose your authorized capital below to see a transparent cost breakdown (government fees + our service charges).
            Required per-director documents: NID, TIN certificate, mobile number, email address, photo.
          </p>

          {/* selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Authorized Share Capital</label>
            <div className="flex flex-wrap gap-2">
              {OPTIONS.map((k) => (
                <Button
                  key={k}
                  onClick={() => setSelectedKey(k)}
                  variant={selectedKey === k ? "default" : "outline"}
                >
                  {COST_DATA[k].label}
                </Button>
              ))}
            </div>
          </div>

          {/* breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Cost breakdown — {dataForSelected.label}</CardTitle>
                    <CardDescription>Government fees (detailed) + our service fee</CardDescription>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimated total</p>
                    <p className="text-2xl font-bold">BDT {formatBDT(dataForSelected.total_cost)}</p>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Government fees</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {Object.entries(dataForSelected.govt).map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="font-mono">BDT {formatBDT(Number(v))}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t pt-2 flex justify-between font-semibold">
                  <span>Total Govt. fees</span>
                  <span>BDT {formatBDT(dataForSelected.govt.total_govt_fees)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Our fees & summary</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Service / Consultancy</span>
                    <span className="font-mono">BDT {formatBDT(dataForSelected.service_fee)}</span>
                  </li>
                </ul>
                <div className="mt-3 border-t pt-2 flex justify-between font-semibold">
                  <span>Total (Govt. + Service)</span>
                  <span>BDT {formatBDT(dataForSelected.total_cost)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
                 <Button onClick={handleDownloadQuote}>
                    Download Quote
                  </Button>
                  <Button asChild variant="outline">
                    <a href="#inquiry">Start Registration</a>
                  </Button>
            </CardFooter>
          </Card>

          {/* full packages table */}
          <Card>
            <CardHeader>
                <CardTitle>Full package list (quick)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Package</th>
                        <th className="py-2 pr-4 font-medium">Govt. Fees</th>
                        <th className="py-2 pr-4 font-medium">Service / Lawyers</th>
                        <th className="py-2 pr-4 font-medium">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OPTIONS.map((k) => {
                        const d = COST_DATA[k];
                        return (
                          <tr key={k} className="border-t">
                            <td className="py-3 pr-4">{d.label}</td>
                            <td className="py-3 pr-4">BDT {formatBDT(d.govt.total_govt_fees)}</td>
                            <td className="py-3 pr-4">BDT {formatBDT(d.service_fee)}</td>
                            <td className="py-3 pr-4 font-semibold">BDT {formatBDT(d.total_cost)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Note: Government fees are approximate and depend on RJSC final calculations. Service fees shown are Shah Mubaruk – consultancy fees for documentation, filing and follow-up.
                </p>
            </CardFooter>
          </Card>
        </div>

        {/* Right column: Ask Shah + contact form */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ask about registration</CardTitle>
                    <CardDescription>Quick questions? Ask Shah — includes this pricing data and will respond with exact breakdowns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-full">
                         <AskShahChat />
                    </div>
                </CardContent>
            </Card>

            <Card id="inquiry">
                <CardHeader>
                    <CardTitle>Start registration / Request a callback</CardTitle>
                </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmitInquiry} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Your name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700">Phone</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801xxxx..." />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700">Email</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700">Message (optional)</label>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Any specific requests or preferred timeline..." />
                    </div>
                    {statusMsg && <div className="text-sm text-muted-foreground mt-2">{statusMsg}</div>}
                    </form>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                  <Button disabled={submitting} type="submit" onClick={handleSubmitInquiry} className="w-full sm:w-auto">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send inquiry
                  </Button>

                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                    // quick populate message with selected option
                    setMessage(`I want to register a Private Limited company (Authorized capital: ${dataForSelected.label}). Please advise next steps and payment details.`);
                    window.scrollTo({ top: document.getElementById("inquiry")?.offsetTop || 0, behavior: "smooth" });
                  }}>
                    Prefill message
                  </Button>
              </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Need company + USA formation?</CardTitle>
                    <CardDescription>We also offer combined Bangladesh + USA formation packages (Global Founder Package). <Link href="/contact" className="text-primary underline">Contact us</Link>.</CardDescription>
                </CardHeader>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
