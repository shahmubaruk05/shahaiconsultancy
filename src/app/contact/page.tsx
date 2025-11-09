import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="container py-12 md:py-24">
            <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
                    <p className="text-muted-foreground text-lg">
                        Have a question or want to discuss a project? Fill out the form or reach out via WhatsApp.
                    </p>
                    <Card>
                        <CardHeader>
                            <CardTitle>Direct Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="#" target="_blank">
                                    <MessageCircle className="mr-2" /> Chat on WhatsApp
                                </Link>
                            </Button>
                             <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="#">
                                    <Phone className="mr-2" /> Book a Consultation
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
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
