
import PptxGenJS from "pptxgenjs";

type Slide = {
  title: string;
  body: string;
};

function parseSlides(markdown: string): Slide[] {
  const lines = markdown.split("\n");
  const slides: Slide[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  function pushSlide() {
    if (!currentTitle && currentBody.length === 0) return;
    slides.push({
      title: currentTitle || "Slide",
      body: currentBody.join("\n").trim(),
    });
    currentTitle = "";
    currentBody = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("### slide")) {
      pushSlide();
      currentTitle = trimmed.replace(/^###\s*/i, "");
    } else {
      currentBody.push(line);
    }
  }
  pushSlide();

  if (slides.length === 0) {
    return [
      {
        title: "Pitch Deck",
        body: markdown,
      },
    ];
  }

  return slides;
}

export async function createPitchDeckPptxFromMarkdown(
  markdown: string,
  startupName?: string
): Promise<Uint8Array> {
  const pptx = new PptxGenJS();

  // Shah Mubaruk – Your Startup Coach brand palette
  const BRAND_BG = "F9FAFB";      // light background
  const BRAND_ACCENT = "2563EB";  // primary blue
  const BRAND_TITLE = "0F172A";   // deep slate for titles
  const BRAND_TEXT = "111827";    // main body text
  const BRAND_MUTED = "6B7280";   // footer text

  // If layout property exists, use 16x9
  // (wrap in try/catch so it doesn’t crash if not supported)
  try {
    // @ts-ignore
    pptx.layout = "16x9";
  } catch (e) {
    // ignore
  }

  const slides = parseSlides(markdown);

  slides.forEach((slide, index) => {
    const s = pptx.addSlide();

    s.background = { color: BRAND_BG };

    // Title
    s.addText(slide.title || `Slide ${index + 1}`, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 1,
      color: BRAND_TITLE,
      fontFace: "Arial",
      fontSize: 28,
      bold: true,
    });

    // Body text as bullets
    const bodyText = slide.body || "";
    const bulletLines = bodyText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (bulletLines.length > 0) {
      s.addText(
        bulletLines.map((t) => ({ text: t, options: { bullet: true } })),
        {
          x: 0.7,
          y: 1.2,
          w: 8.5,
          h: 4,
          color: BRAND_TEXT,
          fontFace: "Arial",
          fontSize: 16,
        }
      );
    }

    // Brand footer (left)
    s.addText("Shah Mubaruk – Your Startup Coach", {
      x: 0.5,
      y: 6.8,
      w: 6,
      h: 0.4,
      fontSize: 10,
      color: BRAND_MUTED,
      fontFace: "Arial",
    });

    // Slide number (right)
    s.addText(`Slide ${index + 1}`, {
      x: 8.0,
      y: 6.8,
      w: 1.5,
      h: 0.4,
      align: "right",
      fontSize: 10,
      color: BRAND_MUTED,
      fontFace: "Arial",
    });
  });

  const fileNameBase =
    (startupName || "pitch-deck")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pitch-deck";

  const arrayBuffer = await pptx.write("arraybuffer");
  const uint8 = new Uint8Array(arrayBuffer as ArrayBuffer);

  return uint8;
}
