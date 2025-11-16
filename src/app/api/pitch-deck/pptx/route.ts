import { NextRequest } from "next/server";
import { createPitchDeckPptxFromMarkdown } from "@/lib/pitch-deck-pptx";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, startupName } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response("Missing content", { status: 400 });
    }

    const pptxBytes = await createPitchDeckPptxFromMarkdown(
      content,
      startupName
    );

    const filenameBase =
      (startupName || "pitch-deck")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "pitch-deck";

    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filenameBase}-pitch-deck.pptx"`
    );

    return new Response(pptxBytes, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("PPTX generation error:", err);
    return new Response("Failed to generate PPTX", { status: 500 });
  }
}
