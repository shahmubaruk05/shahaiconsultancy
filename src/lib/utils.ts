import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function markdownToPlainText(md: string): string {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
