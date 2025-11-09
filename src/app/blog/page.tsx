import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "The Ultimate Guide to Raising Your First Round of Funding",
    category: "Fundraising",
    excerpt: "Learn the exact steps to go from a pitch deck to a signed term sheet. We cover everything from finding investors to negotiating the deal.",
    href: "#",
  },
  {
    title: "Forming Your Company in Bangladesh vs. USA: A Founder's Guide",
    category: "Business Formation",
    excerpt: "Understand the pros and cons of incorporating in Bangladesh versus the USA (Delaware) and choose the right path for your startup.",
    href: "#",
  },
    {
    title: "How to Validate Your Startup Idea Before Writing a Single Line of Code",
    category: "Entrepreneurship",
    excerpt: "Save time and money by validating your business idea with real customers. This guide shows you how.",
    href: "#",
  },
   {
    title: "The Top 5 Marketing Channels for Early-Stage Startups in 2025",
    category: "Marketing",
    excerpt: "Don't waste your budget. Focus on these five marketing channels that deliver the highest ROI for new businesses.",
    href: "#",
  },
  {
    title: "From 10 to 100 Customers: A Framework for Growth",
    category: "Growth",
    excerpt: "Scaling your customer base requires a systematic approach. Here is a step-by-step framework to achieve sustainable growth.",
    href: "#",
  },
   {
    title: "Understanding Your Cap Table: A Simple Guide for Founders",
    category: "Fundraising",
    excerpt: "Your capitalization table is one of the most important documents for your startup. Learn how to manage it effectively.",
    href: "#",
  }
];

const categories = ["All", "Fundraising", "Business Formation", "Entrepreneurship", "Marketing", "Growth"];


export const metadata = {
  title: "Startup Resources & Funding Guides | Shah Mubaruk Blog",
  description: "Explore expert articles on fundraising, business formation, marketing, and growth strategies for startups.",
};

export default function BlogPage() {
    return (
        <div className="container py-12 md:py-24">
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Startup Resources & Insights</h1>
                <p className="text-lg text-muted-foreground">Expert guides on fundraising, strategy, and growth for founders.</p>
            </div>
            
            <div className="flex justify-center mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <Button key={category} variant={category === "All" ? "default" : "outline"}>
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map(post => (
                    <Card key={post.title} className="flex flex-col">
                        <CardHeader>
                            <p className="text-sm font-semibold text-primary">{post.category}</p>
                            <CardTitle className="text-xl">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <CardDescription>{post.excerpt}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="link" className="p-0">
                                <Link href={post.href}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
