import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WHATSAPP_LINK =
  process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/8801XXXXXXXXX";

const GOOGLE_CALENDAR_LINK =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_LINK ||
  "https://calendar.google.com/calendar/u/0/r";

const EMAIL_LINK =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL_LINK || "mailto:hello@shahmubaruk.com";


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const lastUserMessage =
        messages && messages.length > 0
        ? messages[messages.length - 1].content || ""
        : "";

    const systemPrompt =
      process.env.ASK_SHAH_PROMPT ||
      "You are Shah Mubaruk, a startup advisor. Give clear, helpful answers.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "Sorry, no response.";

    let actions: any[] = [];

    const contextText = (reply + " " + lastUserMessage).toLowerCase();

    // 1) Bangladesh company formation (RJSC)
    if (
        contextText.includes("rjsc") ||
        contextText.includes("bangladesh company") ||
        contextText.includes("bd company") ||
        contextText.includes("private limited") ||
        contextText.includes("authorized capital") ||
        contextText.includes("company registration") ||
        contextText.includes("কম্পানি রেজিস্ট্রেশন")
    ) {
        actions.push({
        type: "service-bd-company",
        title: "Bangladesh Company Registration (RJSC)",
        description:
            "RJSC এর মাধ্যমে Private Limited Company রেজিস্ট্রেশন, name clearance থেকে final certificate পর্যন্ত full support।",
        buttonText: "Start BD Registration",
        buttonLink: "/services/company-formation?start=bd",
        });
    }

    // 2) USA LLC formation
    if (
        contextText.includes("llc") ||
        contextText.includes("usa company") ||
        contextText.includes("us company") ||
        contextText.includes("wyoming") ||
        contextText.includes("delaware") ||
        contextText.includes("ein") ||
        contextText.includes("ইউএসএ কোম্পানি")
    ) {
        actions.push({
        type: "service-usa-llc",
        title: "USA LLC Formation Service",
        description:
            "State filing, EIN, Operating Agreement – সব কিছু একসাথে professional support সহ।",
        buttonText: "Form USA LLC",
        buttonLink: "/services/company-formation/usa?start=llc",
        });
    }

    // 3) Strategy / consultation call – Google Calendar booking
    if (
        contextText.includes("consult") ||
        contextText.includes("consultation") ||
        contextText.includes("meeting") ||
        contextText.includes("call") ||
        contextText.includes("schedule") ||
        contextText.includes("appointment") ||
        contextText.includes("মিটিং") ||
        contextText.includes("পরামর্শ")
    ) {
        actions.push({
        type: "contact-call",
        title: "Book a Strategy Call (Google Calendar)",
        description:
            "Google Calendar দিয়ে Shah Mubaruk-এর সাথে ৩০ মিনিটের strategy call শিডিউল করুন।",
        buttonText: "Book via Google Calendar",
        buttonLink: GOOGLE_CALENDAR_LINK,
        });
    }

    // 4) WhatsApp contact suggestion
    if (
        contextText.includes("whatsapp") ||
        contextText.includes("what’s app") ||
        contextText.includes("ওয়াটসঅ্যাপ") ||
        contextText.includes("chat korte chai")
    ) {
        actions.push({
        type: "contact-whatsapp",
        title: "Chat on WhatsApp",
        description:
            "WhatsApp এ সরাসরি মেসেজ করে আপনার প্রশ্ন আলোচনা করতে পারেন।",
        buttonText: "Open WhatsApp",
        buttonLink: WHATSAPP_LINK,
        });
    }

    // 5) Email contact suggestion
    if (
        contextText.includes("email") ||
        contextText.includes("ইমেইল") ||
        contextText.includes("proposal") ||
        contextText.includes("details pathabo") ||
        contextText.includes("send documents")
    ) {
        actions.push({
        type: "contact-email",
        title: "Send an Email",
        description:
            "ডিটেইলস, ডকুমেন্ট বা long-form question ইমেইলের মাধ্যমে পাঠাতে পারেন।",
        buttonText: "Email Shah",
        buttonLink: EMAIL_LINK,
        });
    }

    return NextResponse.json({ reply, actions });
  } catch (err) {
    console.error("Ask Shah API error:", err);
    return NextResponse.json(
      { reply: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
