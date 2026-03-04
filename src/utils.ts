import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function handleGeminiError(error: any) {
  const errorMessage = error?.message?.toLowerCase() || "";
  if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("limit exceeded")) {
    window.dispatchEvent(new CustomEvent('gemini-quota-exceeded'));
    return true;
  }
  return false;
}
