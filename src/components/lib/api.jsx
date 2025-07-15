/**
 * A typed, generic fetch helper for making API requests.
 * Prepends /api/v1 to the path and handles JSON content type.
 * Provides a universal, user-friendly error message on failure.
 * 
 * @template T
 * @param {string} path - The API path (e.g., '/init').
 * @param {RequestInit} [opts={}] - Standard fetch options.
 * @returns {Promise<T>} - A promise that resolves to the JSON response.
 * @throws {Error} - Throws a user-friendly error on network or HTTP error.
 */
export async function api(path, opts = {}) {
  try {
    // All requests are proxied through the /api/v1 prefix
    const res = await fetch(`/api/v1${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    });

    if (!res.ok) {
      // Try to get a more specific error message from the response body
      const errorText = await res.text();
      throw new Error(errorText || `HTTP error! status: ${res.status}`);
    }

    // Handle cases where the response might be empty (e.g., 204 No Content)
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    // Re-throw a more user-friendly error, but include the original message
    const originalMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Whoops! We couldn't reach the server. Please try again or contact support. (${originalMessage})`
    );
  }
}

/**
 * Example usage for initializing a session.
 * 
 * @typedef {Object} InitResponse
 * @property {string} sessionId
 * @property {Object} userProfile
 * @property {Object} nextLesson
 * 
 * @param {{ sessionId?: string }} payload
 * @returns {Promise<InitResponse>}
 */
export const initSession = (payload) =>
  api('/init', {
    method: 'POST',
    body: JSON.stringify(payload),
  });