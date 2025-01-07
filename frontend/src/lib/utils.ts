import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PENDING_PREFIX = "pending_";

export function generateTempId(): string {
  const random = Math.random().toString(36).substr(2, 9);
  return `${PENDING_PREFIX}_${random}`;
}

export function isPendingId(id: string): boolean {
  return id.startsWith(PENDING_PREFIX);
}
