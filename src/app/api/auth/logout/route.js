import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

// Login sets httpOnly cookies (can't be cleared from client JS), so
// logging out needs a server round-trip too — clearing localStorage alone
// leaves those cookies valid and able to authenticate API requests.
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  clearAuthCookies(response); // clears both the access and refresh cookies
  return response;
}