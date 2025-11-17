
'use server';

export function markdownToPlainText(md: string): string {
    return md
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[#>*_]+/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
