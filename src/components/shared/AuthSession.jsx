'use client';

import { useEffect } from 'react';
import { installAuthSession } from '@/lib/authSession';

// Mount once inside the dashboard and admin layouts. Renders nothing; it just
// keeps the login session alive (see lib/authSession.js).
export default function AuthSession() {
  useEffect(() => installAuthSession(window), []);
  return null;
}