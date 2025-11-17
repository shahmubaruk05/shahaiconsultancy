import { NextRequest, NextResponse } from 'next/server';
import { generateCompanyProfilePdf } from '@/lib/company-profile-pdf';

export async function POST(req: NextRequest) {
  try {
    const {
      profileMarkdown,
      companyName,
      industry,
      country,
    } = await req.json();

    if (!profileMarkdown) {
      return new NextResponse('Missing profileMarkdown', { status: 400 });
    }

    const pdfBytes = await generateCompanyProfilePdf({
      profileMarkdown,
      companyName,
      industry,
      country,
    });
    
    const slugifiedCompanyName = (companyName || 'profile')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="company-profile-${slugifiedCompanyName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Failed to generate PDF.', { status: 500 });
  }
}
