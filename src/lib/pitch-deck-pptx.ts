
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

  pptx.layout = "16x9";

  const slides = parseSlides(markdown);

  slides.forEach((slide, index) => {
    const s = pptx.addSlide();

    // Title
    s.addText(slide.title || `Slide ${index + 1}`, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 1,
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
          fontSize: 16,
        }
      );
    }
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
