const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/** True if `url` points back to this SSO service — would cause an infinite loop. */
function isSelf(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Extract and validate the redirect_to param from the current URL.
 * Never returns the SSO origin itself — that would cause a self-redirect loop.
 * Falls back to VITE_DEFAULT_APP_URL, then null (caller must handle).
 */
export function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('redirect_to');

  if (raw) {
    try {
      const url = new URL(raw);
      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return getFallback();
      if (isSelf(url.toString())) return getFallback(); // block self-redirect
      url.searchParams.delete('redirect_to'); // strip nested param
      return url.toString();
    } catch {
      if (raw.startsWith('/')) return raw;
      return getFallback();
    }
  }

  return getFallback();
}

/** Returns the configured default app URL, or null if not set. */
function getFallback() {
  const def = import.meta.env.VITE_DEFAULT_APP_URL?.trim();
  if (def && !isSelf(def)) return def;
  return null; // caller shows login form rather than redirecting to self
}

export function redirectTo(target) {
  window.location.assign(target);
}
