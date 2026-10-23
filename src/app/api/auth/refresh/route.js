import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth';

// Swaps a valid refresh cookie for a fresh access token (and a fresh refresh
// token, so an active user's session slides forward).
//
// Status codes matter to the browser side (see lib/authSession.js):
//   401  the session is really over  -> the client signs the user out
//   500  something temporary broke   -> the client keeps the session and retries later
export async function POST(request) {
  const payload = verifyRefreshToken(request.cookies.get('refreshToken')?.value);

  if (!payload) {
    const res = NextResponse.json({ error: 'Session expired' }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  try {
    // Re-check the account every time, so bans, suspensions and role
    // changes take effect within one access-token lifetime.
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, status: true, emailVerified: true },
    });

    if (!user || !user.emailVerified || user.status === 'BANNED' || user.status === 'SUSPENDED') {
      const res = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const res = NextResponse.json({ token: accessToken });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Could not refresh session' }, { status: 500 });
  }
}