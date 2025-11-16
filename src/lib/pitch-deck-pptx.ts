
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

  // ----- Brand palette (Shah Mubaruk – Your Startup Coach) -----
  const BRAND_BG_LIGHT = "F9FAFB";   // light gray background
  const BRAND_BG_DARK = "0F172A";    // dark navy for cover
  const BRAND_PRIMARY = "2563EB";    // primary blue
  const BRAND_TITLE = "0F172A";      // deep slate for headings
  const BRAND_TEXT = "111827";       // main body text
  const BRAND_MUTED = "6B7280";      // subtle footer text
  const BRAND_FONT = "Arial";

  try {
    // @ts-ignore – layout may not be typed
    pptx.layout = "16x9";
  } catch (e) {
    // ignore if not supported
  }
  
  const slides = parseSlides(markdown);

  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();

    if (index === 0) {
      // --- Cover Slide ---
      slide.background = { color: BRAND_BG_DARK };
      
      const oneLiner = slideData.body.split('\n')[0].replace(/^- /,'').trim();

      // Main title
      slide.addText(startupName || slideData.title, {
        x: 0.7,
        y: 1.6,
        w: 8.6,
        h: 1.5,
        align: "center",
        fontFace: BRAND_FONT,
        fontSize: 40,
        bold: true,
        color: "FFFFFF",
      });

      // Subtitle from first bullet or notes (optional)
      if (oneLiner) {
        slide.addText(oneLiner, {
          x: 1.0,
          y: 3.0,
          w: 8.0,
          h: 1.5,
          align: "center",
          fontFace: BRAND_FONT,
          fontSize: 22,
          color: "E5E7EB",
        });
      }

      // Brand tagline at bottom
      slide.addText("Shah Mubaruk – Your Startup Coach", {
        x: 0,
        y: 6.8,
        w: '100%',
        h: 0.4,
        align: 'center',
        fontFace: BRAND_FONT,
        fontSize: 12,
        color: "E5E7EB",
      });

    } else {
      // --- Content Slides ---
      slide.background = { color: BRAND_BG_LIGHT };

      // Title
      slide.addText(slideData.title, {
        x: 0.7,
        y: 0.5,
        w: 8.6,
        h: 0.8,
        fontFace: BRAND_FONT,
        fontSize: 26,
        bold: true,
        color: BRAND_PRIMARY,
      });

      // Bullet body text
      const bulletLines = (slideData.body.split('\n') ?? []).map(l => l.trim()).filter(Boolean);
      if (bulletLines.length > 0) {
        slide.addText(
          bulletLines.map(text => ({
            text: text.replace(/^- /,''),
            options: {
              bullet: true,
            },
          })),
          {
            x: 0.9,
            y: 1.5,
            w: 8.2,
            h: 4.5,
            fontFace: BRAND_FONT,
            fontSize: 18,
            color: BRAND_TEXT,
            lineSpacing: 28,
          }
        );
      }

      // Footer: brand + slide number
      const slideNumber = index + 1;
      slide.addText("Shah Mubaruk – Your Startup Coach", {
        x: 0.7,
        y: 6.8,
        w: 6.0,
        h: 0.3,
        fontFace: BRAND_FONT,
        fontSize: 10,
        color: BRAND_MUTED,
      });

      slide.addText(`Slide ${slideNumber}`, {
        x: 7.5,
        y: 6.8,
        w: 2.0,
        h: 0.3,
        align: "right",
        fontFace: BRAND_FONT,
        fontSize: 10,
        color: BRAND_MUTED,
      });
    }
  });

  const arrayBuffer = await pptx.write("arraybuffer");
  const uint8 = new Uint8Array(arrayBuffer as ArrayBuffer);

  return uint8;
}
