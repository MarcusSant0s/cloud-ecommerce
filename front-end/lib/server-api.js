// Base URL for server-side (SSR / Server Component) API calls.
//
// The browser reaches the API through nginx via NEXT_PUBLIC_API_URL
// (e.g. https://domain/api). But inside Docker, the web container cannot
// reach its own public domain — it must call the backend directly on the
// internal network (e.g. http://commerce-api:8080). Set INTERNAL_API_URL for
// that. Falls back to the public URL for local dev where they're the same host.
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
