import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Only allow internal, same-origin paths as redirect targets.
 * Blocks absolute URLs and protocol-relative ("//evil.com") open redirects.
 */
export function sanitizeRedirect(raw, fallback = "/") {
  return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
    ? raw
    : fallback;
}


  