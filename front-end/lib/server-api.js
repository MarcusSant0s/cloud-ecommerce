// Base URL for server-side (SSR / Server Component) API calls.
//
// The browser reaches the API through nginx via NEXT_PUBLIC_API_URL
// (e.g. https://domain/api). But inside Docker, the web container cannot
// reach its own public domain — it must call the backend directly on the
// internal network (e.g. http://commerce-api:8080). Set INTERNAL_API_URL for
// that. Falls back to the public URL for local dev where they're the same host.
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

// Default ceiling for a single server-side API call, in milliseconds.
export const FETCH_TIMEOUT = 5000;

// Server-side JSON fetch that can never hang the render.
//
// A plain try/catch only covers a refused connection. If the backend accepts
// the TCP connection but never answers (container up but app dead, exhausted
// DB pool, slow network), the fetch waits on the OS timeout — the route never
// renders and nginx returns a 504. The AbortController caps that at 5s.
//
// Returns null on any failure — timeout, non-2xx, or a non-JSON body such as
// an HTML error page — so callers degrade to an empty state instead of throwing.
export async function fetchJson(path, options = {}) {
  const { timeout = FETCH_TIMEOUT, ...init } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
