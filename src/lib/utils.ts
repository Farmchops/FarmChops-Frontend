import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extract an error message from unknown errors (network, fetchBaseQuery, thrown Error, strings)
 */
export function resolveErrorMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || String(err);
  // Handle RTK Query / fetchBaseQuery network error shape: { status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }
  try {
    const e = err as Record<string, unknown>;
    if (e.status === 'FETCH_ERROR') {
      // Provide a clearer network/CORS message
      return 'Network error: Unable to reach API. Check your API base URL, server status and CORS policy.';
    }

    // Try to read common shapes like { data: { message: string } } or { message }
    if (e.data && typeof e.data === 'object') {
      const d = e.data as Record<string, unknown>;
      if (typeof d.message === 'string') return d.message;
    }
    if (typeof e.message === 'string') return e.message;

    // Fallback to JSON
    return JSON.stringify(e);
  } catch {
    return String(err);
  }
}
