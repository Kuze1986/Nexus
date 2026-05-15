const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Extract and validate the redirect_to param from the current URL.
 * Returns null if missing or unsafe (e.g. javascript:, data:).
 */
export function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('redirect_to');

  if (!raw) {
    return import.meta.env.VITE_DEFAULT_APP_URL || window.location.origin;
  }

  try {
    const url = new URL(raw);
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return window.location.origin;
    // Strip nested redirect_to to prevent loop growth
    url.searchParams.delete('redirect_to');
    return url.toString();
  } catch {
    // relative path
    if (raw.startsWith('/')) return raw;
    return window.location.origin;
  }
}

export function redirectTo(target) {
  window.location.assign(target);
}
