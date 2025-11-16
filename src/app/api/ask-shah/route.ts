import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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

    let actions = [];

    if (
      reply.toLowerCase().includes("company") ||
      reply.toLowerCase().includes("rjsc") ||
      reply.toLowerCase().includes("registration") ||
      reply.toLowerCase().includes("limited company") ||
      reply.toLowerCase().includes("authorized capital")
    ) {
      actions.push({
        type: "service",
        title: "Start Bangladesh Company Registration",
        description: "RJSC দিয়ে Private Limited Company রেজিস্ট্রেশন ৭-১০ দিনের মধ্যে সম্পন্ন করা হয়।",
        buttonText: "Start Registration",
        buttonLink: "/services/company-formation?start=true"
      });
    }

    if (
      reply.toLowerCase().includes("llc") ||
      reply.toLowerCase().includes("usa company") ||
      reply.toLowerCase().includes("ein") ||
      reply.toLowerCase().includes("state filing")
    ) {
      actions.push({
        type: "service",
        title: "Start USA LLC Formation",
        description: "USA LLC ফাইলিং, EIN, Operating Agreement—সব কিছু এক জায়গায়।",
        buttonText: "Form LLC",
        buttonLink: "/services/company-formation/usa?start=true"
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
