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

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Ask Shah API error:", err);
    return NextResponse.json(
      { reply: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
