import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// BOLDkit expects cn to merge conflicting Tailwind classes (clsx + tailwind-merge).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
