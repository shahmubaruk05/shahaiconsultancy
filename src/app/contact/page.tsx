import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/8801711781232?text=Hi%20Shah%2C%20I%20want%20to%20discuss%20a%20startup%20project.";
const CALENDAR_BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendar.app.google/RZbbH8ZBxXtfvUoa6";

export default function ContactPage() {
    return (
        <div className="container py-12 md:py-24">
            <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
                    <p className="text-muted-foreground text-lg">
                        Have a question or want to discuss a project? Fill out the form or reach out via WhatsApp.
                    </p>
                    <div className="space-y-3">
                      {/* Chat on WhatsApp */}
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200">
                            {/* small chat icon circle */}
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          Chat on WhatsApp
                        </span>
                        <span className="text-xs text-slate-400">Opens in WhatsApp</span>
                      </a>

                      {/* Book a Consultation */}
                      <a
                        href={CALENDAR_BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200">
                            {/* small calendar dot */}
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          </span>
                          Book a Consultation
                        </span>
                        <span className="text-xs text-slate-400">Opens in Calendar</span>
                      </a>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send a Message</CardTitle>
                        <CardDescription>We'll get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your Name" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" />
                            </div>
                            <Button type="submit">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}