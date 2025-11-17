
import { NextResponse } from "next/server";
import { generatePreviewImageFromMarkdown } from "@/lib/preview-image";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown, title } = body;

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "Missing markdown" },
        { status: 400 }
      );
    }

    const imageBuffer = await generatePreviewImageFromMarkdown({
      markdown,
      title: title || "Generated Preview",
    });

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("preview-image API error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview image." },
      { status: 500 }
    );
  }
}
