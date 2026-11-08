/**
 * API configuration and service URL resolution.
 *
 * In a multi-service Vercel deployment:
 * 1. Server-side (Functions/SSR): Vercel service binding injects `process.env.BACKEND_URL`.
 * 2. Client-side (Browser): Requests use relative root (e.g. `/api/...`) so Vercel's
 *    top-level service rewrites route `/api/(.*)` to the FastAPI backend service.
 * 3. Local Development: Vite development proxy or fallback to `http://localhost:8000`.
 */

export function getBackendBaseUrl(): string {
  // Server-side (Functions / SSR):
  if (typeof window === "undefined") {
    const boundUrl =
      (typeof process !== "undefined" && process.env?.BACKEND_URL) ||
      (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
      (import.meta as any).env?.VITE_API_URL;
    if (boundUrl && typeof boundUrl === "string") {
      return boundUrl.replace(/\/+$/, "");
    }
    return "http://localhost:8000";
  }

  // Client-side (Browser):
  const clientExplicitUrl = (import.meta as any).env?.VITE_API_URL;
  if (clientExplicitUrl && typeof clientExplicitUrl === "string") {
    return clientExplicitUrl.replace(/\/+$/, "");
  }

  // Default to relative root ("") so browser requests hit `/api/...` on the same host,
  // routed to the backend service via Vercel service rewrites or Vite dev proxy.
  return "";
}

/**
 * Constructs a fully qualified or clean relative URL for the backend API.
 */
export function buildBackendApiUrl(path: string): string {
  const base = getBackendBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) {
    return cleanPath;
  }
  return `${base}${cleanPath}`;
}
