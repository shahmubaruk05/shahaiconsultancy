
'use client';
import { Packer, Document, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

/**
 * Converts an HTML string to a DOCX file and triggers a download.
 * @param htmlContent The HTML string to convert.
 * @param fileName The name of the file to be downloaded (without extension).
 */
export async function exportToDocx(htmlContent: string, fileName: string): Promise<void> {
  try {
    const fileBuffer = await htmlToDocx(htmlContent, undefined, {
      font: 'Calibri',
      fontSize: 22, // Corresponds to 11pt
    });
    
    saveAs(fileBuffer as Blob, `${fileName}.docx`);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    // You might want to show a toast notification to the user here
  }
}

/**
 * Opens the browser's print dialog to save an HTML string as a PDF.
 * @param htmlContent The HTML string to print.
 * @param documentTitle The title of the document shown in the print dialog.
 */
export function exportToPdf(htmlContent: string, documentTitle: string): void {
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.title = documentTitle;
    printWindow.document.close();
    
    // Wait for the content to be fully parsed and rendered
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // The window is often closed by the browser's print preview automatically,
      // but we can add a fallback.
      // setTimeout(() => printWindow.close(), 500);
    };
  } else {
    alert('Could not open print window. Please disable your pop-up blocker.');
  }
}
