
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
  const BRAND_BG_LIGHT = "F9FAFB";
  const BRAND_BG_DARK = "0F172A";
  const BRAND_BG_ALT = "EFF6FF"; // A lighter blue for alt backgrounds
  const BRAND_PRIMARY = "2563EB";
  const BRAND_PRIMARY_DARK = "1E3A8A"; // Darker navy blue
  const BRAND_ACCENT = "FBBF24"; // Amber/yellow accent
  const BRAND_TITLE = "0F172A";
  const BRAND_TEXT = "111827";
  const BRAND_MUTED = "6B7280";
  const BRAND_FONT = "Arial";


  try {
    // @ts-ignore – layout may not be typed
    pptx.layout = "16x9";
  } catch (e) {
    // ignore if not supported
  }

  const slides = parseSlides(markdown);

  // Helper: brand chrome (top bar + footer)
  function addBrandChrome(
    slide: PptxGenJS.Slide,
    index: number,
    totalSlides: number,
    title?: string
  ) {
    // Top colored band
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.6,
      fill: { color: BRAND_PRIMARY },
      line: { color: BRAND_PRIMARY },
    });

    // App / brand name (top-left)
    slide.addText("Shah Mubaruk – Your Startup Coach", {
      x: 0.3,
      y: 0.1,
      w: 6.5,
      h: 0.4,
      fontFace: BRAND_FONT,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
    });

    // Optional small section title on top-right
    if (title) {
      slide.addText(title, {
        x: 6.8,
        y: 0.1,
        w: 3,
        h: 0.4,
        align: "right",
        fontFace: BRAND_FONT,
        fontSize: 12,
        color: "DBEAFE",
      });
    }

    // Footer bar (thin)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 6.7,
      w: 10,
      h: 0.25,
      fill: { color: BRAND_BG_ALT },
      line: { color: BRAND_BG_ALT },
    });

    slide.addText("www.shahmubaruk.com", {
      x: 0.3,
      y: 6.72,
      w: 5,
      h: 0.25,
      fontFace: BRAND_FONT,
      fontSize: 10,
      color: BRAND_MUTED,
    });

    slide.addText(`Slide ${index + 1} of ${totalSlides}`, {
      x: 6.5,
      y: 6.72,
      w: 3,
      h: 0.25,
      align: "right",
      fontFace: BRAND_FONT,
      fontSize: 10,
      color: BRAND_MUTED,
    });
  }

  // MAIN: generate slides
  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    const totalSlides = slides.length;

    const bulletsFromBody = slideData.body.split('\n').map(l => l.trim().replace(/^- /, '')).filter(Boolean);
    const notesFromBody = ""; // Assuming notes aren't parsed separately in the current helper

    // COVER SLIDE
    if (index === 0) {
      slide.background = { color: BRAND_PRIMARY_DARK };

      // semi-transparent overlay box
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        h: 3.4,
        fill: { color: "000000", transparency: 40 },
        line: { color: "000000", transparency: 100 },
      });

      slide.addText(slideData.title ?? "Pitch Deck", {
        x: 1,
        y: 1.6,
        w: 8,
        h: 1,
        fontFace: BRAND_FONT,
        fontSize: 40,
        bold: true,
        color: "FFFFFF",
      });

      const sub = bulletsFromBody[0] || "Investment-ready pitch for your startup.";

      slide.addText(sub, {
        x: 1,
        y: 2.6,
        w: 7.8,
        h: 0.9,
        fontFace: BRAND_FONT,
        fontSize: 20,
        color: "E5E7EB",
      });
      
      slide.addText("Prepared with BizSpark – by Shah Mubaruk", {
        x: 1,
        y: 3.7,
        w: 7.8,
        h: 0.6,
        fontFace: BRAND_FONT,
        fontSize: 14,
        color: "BFDBFE",
      });

      slide.addText("Your Startup Coach", {
        x: 1,
        y: 4.2,
        w: 7.8,
        h: 0.6,
        fontFace: BRAND_FONT,
        fontSize: 12,
        color: BRAND_ACCENT,
      });


      // bottom footer on cover
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 6.7,
        w: 10,
        h: 0.25,
        fill: { color: "020617" },
        line: { color: "020617" },
      });
      slide.addText("Shah Mubaruk – Your Startup Coach", {
        x: 0.3,
        y: 6.7,
        w: 9.4,
        h: 0.25,
        align: "center",
        fontFace: BRAND_FONT,
        fontSize: 10,
        color: "E5E7EB",
      });

      return;
    }

    // NORMAL SLIDES (Problem, Solution, Market etc.)
    slide.background = { color: BRAND_BG_LIGHT };

    // Brand chrome (top bar + footer)
    addBrandChrome(slide, index, totalSlides, slideData.title);

    // Left accent strip
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0.6,
      w: 0.25,
      h: 6.1,
      fill: { color: BRAND_PRIMARY },
      line: { color: BRAND_PRIMARY },
    });

    // Main slide title (big, center-left)
    slide.addText(slideData.title, {
      x: 0.6,
      y: 0.9,
      w: 8.8,
      h: 0.9,
      fontFace: BRAND_FONT,
      fontSize: 30,
      bold: true,
      color: BRAND_TEXT,
    });

    // Small accent underline
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 1.8,
      w: 1.8,
      h: 0,
      line: { color: BRAND_ACCENT, width: 2 },
    });

    // Content area: bullets vs. notes
    const hasBullets = bulletsFromBody && bulletsFromBody.length > 0;

    if (hasBullets) {
      // bullets on left
      slide.addText(
        bulletsFromBody.map((b) => ({
          text: b,
          options: { bullet: { type: "circle" as const } },
        })),
        {
          x: 0.9,
          y: 2.1,
          w: 5.8,
          h: 3.7,
          fontFace: BRAND_FONT,
          fontSize: 20,
          color: BRAND_TEXT,
          lineSpacing: 28,
        }
      );
    }

    if (notesFromBody) {
      // “Key takeaway” style notes box on right
      slide.addShape(pptx.ShapeType.rect, {
        x: 6.9,
        y: 2.1,
        w: 2.7,
        h: 3.4,
        fill: { color: BRAND_BG_ALT },
        line: { color: "DBEAFE" },
      });

      slide.addText("Key Takeaway", {
        x: 7.1,
        y: 2.2,
        w: 2.4,
        h: 0.4,
        fontFace: BRAND_FONT,
        fontSize: 12,
        bold: true,
        color: BRAND_PRIMARY_DARK,
      });

      slide.addText(notesFromBody, {
        x: 7.1,
        y: 2.6,
        w: 2.4,
        h: 2.7,
        fontFace: BRAND_FONT,
        fontSize: 12,
        color: BRAND_MUTED,
        lineSpacing: 18,
      });
    }
  });


  const arrayBuffer = await pptx.write("arraybuffer");
  const uint8 = new Uint8Array(arrayBuffer as ArrayBuffer);

  return uint8;
}
