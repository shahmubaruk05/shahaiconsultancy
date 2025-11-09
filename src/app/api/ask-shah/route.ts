
  import { NextResponse } from "next/server";
  import { openai } from "@/lib/openaiClient";

  export async function POST(request: Request) {
    try {
      const body = await request.json();
      const question: string = body.question;
      const history = (body.history || []) as {
        role: "user" | "assistant";
        content: string;
      }[];

      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY not configured" },
          { status: 500 }
        );
      }

      if (!question || typeof question !== "string") {
        return NextResponse.json(
          { error: "Invalid question" },
          { status: 400 }
        );
      }

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        {
          role: "system",
          content:
            "You are Shah Mubaruk – Your Startup Coach. You help Bangladeshi and global founders with startup, funding, licensing, tax, strategy and marketing. " +
            "Your tone is friendly, practical, and slightly mix of Bangla+English when helpful. Keep answers structured and actionable.",
        },
        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: question },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
      });

      const answer =
        response.choices[0]?.message?.content ||
        "Sorry, I could not generate a response right now.";

      return NextResponse.json({ answer });
    } catch (error) {
      console.error("Ask Shah API error:", error);
      return NextResponse.json(
        { error: "Unexpected error generating reply" },
        { status: 500 }
      );
    }
  }
