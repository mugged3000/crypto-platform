import jwt from 'jsonwebtoken';

// Reads and verifies the JWT that /api/auth/login sets as an httpOnly
// cookie named 'token'. Returns the decoded payload ({ id, email, role })
// or null if there's no valid session — never throws, so callers can just
// check for null instead of wrapping every call in try/catch.
export function getUserFromRequest(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Expired or tampered token — treat exactly like "not logged in".
    return null;
  }
}
