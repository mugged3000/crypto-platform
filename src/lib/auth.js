import jwt from 'jsonwebtoken';

// ── Session model ────────────────────────────────────────────────────────
// Two httpOnly cookies:
//   token         short-lived access JWT (JWT_EXPIRES_IN, e.g. 15m).
//                 Sent with every request and checked by getUserFromRequest.
//   refreshToken  long-lived JWT (JWT_REFRESH_EXPIRES_IN, e.g. 7d), signed
//                 with a different secret and only sent to /api/auth/*.
//                 /api/auth/refresh trades it for a fresh access token, so
//                 users stay signed in without keeping a long-lived access token.

const SEVEN_DAYS = 60 * 60 * 24 * 7;

// Turns "15m" / "12h" / "7d" / "3600" into seconds (for cookie maxAge).
function toSeconds(value, fallback) {
  const match = /^(\d+)\s*([smhd]?)$/i.exec(String(value || '').trim());
  if (!match) return fallback;
  const n = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  return n * { s: 1, m: 60, h: 3600, d: 86400 }[unit];
}

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

export function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// Returns the payload, or null if the token is missing, expired or not a refresh token.
export function verifyRefreshToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return payload.type === 'refresh' ? payload : null;
  } catch {
    return null;
  }
}

export function setAuthCookies(response, accessToken, refreshToken) {
  response.cookies.set('token', accessToken, {
    ...cookieBase(),
    maxAge: SEVEN_DAYS,
    path: '/',
  });
  response.cookies.set('refreshToken', refreshToken, {
    ...cookieBase(),
    maxAge: toSeconds(process.env.JWT_REFRESH_EXPIRES_IN, SEVEN_DAYS),
    path: '/api/auth', // never sent to ordinary API routes
  });
}

export function clearAuthCookies(response) {
  response.cookies.set('token', '', { ...cookieBase(), maxAge: 0, path: '/' });
  response.cookies.set('refreshToken', '', { ...cookieBase(), maxAge: 0, path: '/api/auth' });
}

// Reads and verifies the access JWT from the 'token' cookie. Returns the
// decoded payload ({ id, email, role }) or null if there's no valid session —
// never throws, so callers can just check for null.
export function getUserFromRequest(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === 'refresh') return null; // a refresh token is not an access token
    return payload;
  } catch {
    // Expired or tampered token — treat exactly like "not logged in".
    return null;
  }
}