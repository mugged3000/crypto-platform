import { NextResponse } from 'next/server';

// Login sets an httpOnly cookie (can't be cleared from client JS), so
// logging out needs a server round-trip too — clearing localStorage alone
// leaves that cookie valid and able to authenticate API requests.
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
