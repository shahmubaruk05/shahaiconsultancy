import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

type PdfOptions = {
  profileMarkdown: string;
  companyName?: string;
  industry?: string;
  country?: string;
};

const COLORS = {
  H1: rgb(0.058, 0.09, 0.16), // #0F172A
  H2: rgb(0.145, 0.388, 0.921), // #2563EB
  H3: rgb(0.066, 0.094, 0.152), // #111827
  BODY: rgb(0.066, 0.094, 0.152),
  MUTED: rgb(0.42, 0.447, 0.502), // #6B7280
};

const FONT_SIZES = {
  H1: 24,
  H2: 18,
  H3: 14,
  BODY: 11,
  HEADER_FOOTER: 9,
};

async function embedFonts(pdfDoc: PDFDocument) {
  const [interRegular, interBold] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
  ]);
  return { interRegular, interBold };
}

function renderHeader(
  page: any,
  fonts: { interRegular: PDFFont; interBold: PDFFont },
  companyName: string
) {
  page.drawText(companyName, {
    x: 59,
    y: page.getHeight() - 50,
    font: fonts.interBold,
    size: FONT_SIZES.HEADER_FOOTER,
    color: COLORS.MUTED,
  });

  page.drawText('Prepared with BizSpark – by Shah Mubaruk', {
    x: page.getWidth() - 250,
    y: page.getHeight() - 50,
    font: fonts.interRegular,
    size: FONT_SIZES.HEADER_FOOTER,
    color: COLORS.MUTED,
  });
}

function renderFooter(
  page: any,
  fonts: { interRegular: PDFFont; interBold: PDFFont },
  pageNumber: number,
  totalPages: number
) {
  const y = 60;
  page.drawLine({
    start: { x: 59, y: y + 8 },
    end: { x: page.getWidth() - 59, y: y + 8 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  page.drawText('Shah Mubaruk – Your Startup Coach', {
    x: 59,
    y,
    font: fonts.interRegular,
    size: FONT_SIZES.HEADER_FOOTER,
    color: COLORS.MUTED,
  });

  page.drawText('www.shahmubaruk.com', {
    x: page.getWidth() / 2 - 50,
    y,
    font: fonts.interRegular,
    size: FONT_SIZES.HEADER_FOOTER,
    color: COLORS.MUTED,
  });

  page.drawText(`Page ${pageNumber} of ${totalPages}`, {
    x: page.getWidth() - 100,
    y,
    font: fonts.interRegular,
    size: FONT_SIZES.HEADER_FOOTER,
    color: COLORS.MUTED,
  });
}

function wrapText(text: string, width: number, font: PDFFont, fontSize: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const lineWithWord = currentLine === '' ? word : `${currentLine} ${word}`;
    const lineWidth = font.widthOfTextAtSize(lineWithWord, fontSize);
    if (lineWidth < width) {
      currentLine = lineWithWord;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateCompanyProfilePdf(
  options: PdfOptions
): Promise<Uint8Array> {
  const { profileMarkdown, companyName = 'Company Profile' } = options;
  const pdfDoc = await PDFDocument.create();
  const fonts = await embedFonts(pdfDoc);

  const pageMargin = 59; // ~2cm
  const contentWidth = 595 - pageMargin * 2; // A4 width
  const pageHeight = 842;
  const contentHeight = pageHeight - 140;

  let currentPage = pdfDoc.addPage();
  let y = pageHeight - 85;

  const markdownLines = profileMarkdown.split('\n');

  for (const line of markdownLines) {
    const trimmedLine = line.trim();
    let font = fonts.interRegular;
    let fontSize = FONT_SIZES.BODY;
    let color = COLORS.BODY;
    let lineHeight = FONT_SIZES.BODY * 1.4;
    let text = trimmedLine;

    if (trimmedLine.startsWith('## ')) {
      font = fonts.interBold;
      fontSize = FONT_SIZES.H2;
      color = COLORS.H2;
      lineHeight = fontSize * 1.5;
      text = trimmedLine.substring(3);
      y -= 10;
    } else if (trimmedLine.startsWith('### ')) {
      font = fonts.interBold;
      fontSize = FONT_SIZES.H3;
      color = COLORS.H3;
      lineHeight = fontSize * 1.4;
      text = trimmedLine.substring(4);
      y -= 8;
    } else if (trimmedLine.startsWith('- ')) {
      text = `• ${trimmedLine.substring(2)}`;
    } else if (trimmedLine === '---') {
        y -= 15;
        currentPage.drawLine({
            start: { x: pageMargin, y },
            end: { x: currentPage.getWidth() - pageMargin, y },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8)
        });
        y -= 15;
        continue;
    } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        font = fonts.interBold;
        text = trimmedLine.substring(2, trimmedLine.length - 2);
    }


    if (!text) {
      y -= lineHeight;
      continue;
    }
    
    const wrappedLines = wrapText(text, contentWidth, font, fontSize);

    for (const wrapped of wrappedLines) {
      if (y < 100) {
        renderHeader(currentPage, fonts, companyName);
        currentPage = pdfDoc.addPage();
        y = pageHeight - 85;
      }

      currentPage.drawText(wrapped, {
        x: pageMargin,
        y,
        font,
        size: fontSize,
        color,
        lineHeight,
      });

      y -= lineHeight;
    }
  }

  renderHeader(currentPage, fonts, companyName);

  const totalPages = pdfDoc.getPages().length;
  pdfDoc.getPages().forEach((page, i) => {
    renderFooter(page, fonts, i + 1, totalPages);
  });

  return pdfDoc.save();
}
