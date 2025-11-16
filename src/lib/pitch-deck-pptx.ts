
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

  // 16:9 wide layout
  pptx.layout = "16x9";

  // ----- Brand palette (Shah Mubaruk – Your Startup Coach) -----
  const BRAND_BG = "F9FAFB";        // soft light gray/white background
  const BRAND_ACCENT = "2563EB";    // primary blue
  const BRAND_TITLE = "0F172A";     // deep slate for titles
  const BRAND_TEXT = "111827";      // main body text
  const BRAND_MUTED = "6B7280";     // footer / subtle text

  const slides = parseSlides(markdown);

  slides.forEach((slide, index) => {
    const s = pptx.addSlide();

    // Background color
    s.background = { color: BRAND_BG };

    // Left accent bar (brand blue)
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.25,
      h: 7.0,
      fill: { color: BRAND_ACCENT },
      line: { color: "FFFFFF" },
    });

    // Top subtle bar (optional header accent)
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.2,
      fill: { color: BRAND_ACCENT },
      line: { color: BRAND_ACCENT },
    });

    // Slide title
    const titleText =
      slide.title || (index === 0 && startupName)
        ? slide.title || startupName || `Slide ${index + 1}`
        : `Slide ${index + 1}`;

    s.addText(titleText, {
      x: 0.6,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: BRAND_TITLE,
      fontFace: "Arial",
    });

    // Body text as bullet points
    const bodyText = slide.body || "";
    const bulletLines = bodyText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (bulletLines.length > 0) {
      s.addText(
        bulletLines.map((t) => ({
          text: t,
          options: { bullet: true },
        })),
        {
          x: 0.8,
          y: 1.4,
          w: 8.8,
          h: 4.2,
          fontSize: 16,
          color: BRAND_TEXT,
          fontFace: "Arial",
        }
      );
    }

    // Footer: brand name (left) + slide number (right)
    s.addText("Shah Mubaruk – Your Startup Coach", {
      x: 0.6,
      y: 6.8,
      w: 6,
      h: 0.4,
      fontSize: 10,
      color: BRAND_MUTED,
      fontFace: "Arial",
    });

    s.addText(`Slide ${index + 1}`, {
      x: 7.8,
      y: 6.8,
      w: 2,
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
