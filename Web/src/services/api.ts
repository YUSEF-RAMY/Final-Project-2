// ─── Central API Configuration ───────────────────────────────────────────────
// All API communication in this app flows through this file.
// To point the app at a different backend, change VITE_API_BASE_URL in .env.

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

// The storage root is the URL without the trailing /api segment.
// Used to resolve relative image paths returned by the backend.
export const STORAGE_BASE_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');

// ─── Shared request headers ───────────────────────────────────────────────────

/** Returns auth + JSON headers for every authenticated request. */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  };
}

/** Returns auth headers without Content-Type (for FormData / multipart uploads). */
export function getAuthHeadersMultipart(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'ngrok-skip-browser-warning': '69420',
  };
}

// ─── Image URL resolver ───────────────────────────────────────────────────────

/**
 * Converts any image path the backend might return into a fully-qualified URL.
 *
 * The backend sometimes returns:
 *  - a relative path  →  prepend STORAGE_BASE_URL
 *  - a localhost URL  →  swap the host for STORAGE_BASE_URL (ngrok compatibility)
 *  - an already-absolute public URL  →  return as-is
 */
export function resolveImageUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null;
  if (!rawUrl.startsWith('http')) {
    return `${STORAGE_BASE_URL}/${rawUrl.replace(/^\//, '')}`;
  }
  if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    try {
      const u = new URL(rawUrl);
      return `${STORAGE_BASE_URL}${u.pathname}${u.search}`;
    } catch {
      return rawUrl;
    }
  }
  return rawUrl;
}

// ─── 401 handler ─────────────────────────────────────────────────────────────

/** Clears stored tokens and throws UNAUTHORIZED so callers can redirect. */
export function handleUnauthorized(): never {
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
  throw new Error('UNAUTHORIZED');
}
