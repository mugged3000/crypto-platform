// Keeps a signed-in browser session alive.
//
// The server issues a 15-minute access token and a 7-day refresh token (see
// lib/auth.js). Everything here is about swapping the refresh token for a new
// access token at the right moments, so the user never has to log in again
// just because a few minutes went by (or the PC went to sleep).
//
// It does three things:
//   1. Wraps window.fetch: if an /api request comes back 401/403, it refreshes
//      the session once and replays the request. Pages need no changes.
//   2. Refreshes quietly in the background every few minutes while the tab is open.
//   3. Refreshes when the tab wakes up or the connection returns after a gap.
//
// The user is only signed out when the SERVER says the session is truly over
// (refresh answers 401). Being offline or a server hiccup never logs anyone out.

const REFRESH_EVERY_MS = 10 * 60 * 1000; // access tokens last 15 minutes
const STALE_AFTER_MS   = 10 * 60 * 1000;

export function installAuthSession(win = window) {
  const nativeFetch = win.fetch;              // kept so cleanup can restore it exactly
  const originalFetch = nativeFetch.bind(win);
  let inFlight = null;          // one refresh at a time, shared by every caller
  let lastRefresh = Date.now();

  const endSession = () => {
    try {
      win.localStorage.removeItem('vaultex_token');
      win.localStorage.removeItem('vaultex_user');
    } catch {}
    win.location.href = '/login';
  };

  // Resolves to 'ok' | 'expired' (really signed out) | 'error' (offline / server problem)
  const refresh = () => {
    if (!inFlight) {
      inFlight = originalFetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
        .then(async (res) => {
          if (res.ok) {
            lastRefresh = Date.now();
            const data = await res.json().catch(() => ({}));
            // localStorage only tells the layouts "someone is logged in"; keep it current.
            if (data.token) {
              try { win.localStorage.setItem('vaultex_token', data.token); } catch {}
            }
            return 'ok';
          }
          return res.status === 401 ? 'expired' : 'error';
        })
        .catch(() => 'error')
        .finally(() => { inFlight = null; });
    }
    return inFlight;
  };

  const isProtectedApiCall = (input) => {
    try {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, win.location.origin);
      return (
        url.origin === win.location.origin &&
        url.pathname.startsWith('/api/') &&
        !url.pathname.startsWith('/api/auth/') // login, logout, refresh handle themselves
      );
    } catch {
      return false;
    }
  };

  win.fetch = async (input, init) => {
    if (!isProtectedApiCall(input)) return originalFetch(input, init);

    // A Request body can only be read once, so keep a spare copy for the replay.
    const spare = typeof Request !== 'undefined' && input instanceof Request ? input.clone() : input;

    const response = await originalFetch(input, init);
    // Admin routes answer 403 (not 401) when there is no valid session.
    if (response.status !== 401 && response.status !== 403) return response;

    const outcome = await refresh();
    if (outcome === 'expired') {
      endSession();
      return response;
    }
    if (outcome !== 'ok') return response; // offline etc.: hand back the original answer

    return originalFetch(spare, init); // replay once with the new cookie
  };

  const refreshIfStale = async () => {
    if (Date.now() - lastRefresh < STALE_AFTER_MS) return;
    if ((await refresh()) === 'expired') endSession();
  };

  const onVisible = () => {
    if (win.document && win.document.visibilityState === 'visible') refreshIfStale();
  };

  const timer = win.setInterval(refreshIfStale, REFRESH_EVERY_MS);
  win.addEventListener('online', refreshIfStale);
  win.addEventListener('focus', refreshIfStale);
  if (win.document) win.document.addEventListener('visibilitychange', onVisible);

  // Cleanup: put everything back exactly as it was.
  return () => {
    win.fetch = nativeFetch;
    win.clearInterval(timer);
    win.removeEventListener('online', refreshIfStale);
    win.removeEventListener('focus', refreshIfStale);
    if (win.document) win.document.removeEventListener('visibilitychange', onVisible);
  };
}