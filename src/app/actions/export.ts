
'use server';

import { Packer } from 'docx';
import { saveAs } from 'file-saver';

// This is a placeholder for the actual html-to-docx logic.
// In a real scenario, you would use a library that works on the server.
// For now, we will simulate the buffer creation.
async function htmlToDocx(htmlContent: string): Promise<Buffer> {
    // This is a mock implementation.
    // The real `html-to-docx` would do a complex conversion here.
    const textContent = `This is a mock DOCX conversion of: ${htmlContent.substring(0, 100)}...`;
    return Buffer.from(textContent);
}


export async function exportToDocxServer(htmlContent: string): Promise<Buffer> {
    try {
        const fileBuffer = await htmlToDocx(htmlContent);
        if (fileBuffer instanceof Buffer) {
            return fileBuffer;
        }
        
        const arrayBuffer = await (fileBuffer as Blob).arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error("Error in exportToDocxServer:", error);
        throw new Error("Failed to generate DOCX file on the server.");
    }
}
