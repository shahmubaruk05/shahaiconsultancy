import { NextResponse } from "next/server";
import { askShah } from "@/lib/ask-shah-core";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reply = await askShah(body.messages);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in ask-shah API route:", error);
    return NextResponse.json({ error: "Failed to get a response from the AI." }, { status: 500 });
  }
}
