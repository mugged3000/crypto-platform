'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  // Strict Mode runs effects twice in development, which would otherwise
  // fire this fetch twice — the second call then fails because the token
  // was already marked used by the first. This ref makes sure the actual
  // request only ever goes out once per page load.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token. Please use the exact link from your email.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Something went wrong verifying your email.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully! You can now log in.');
      } catch (err) {
        setStatus('error');
        setMessage('Could not reach the server. Please check your connection and try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-md bg-navy-700 border border-white/5 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-navy-700 to-navy-800 border-b border-gold/15 px-8 py-8 text-center">
          <div className="text-2xl font-black tracking-tight">
            <span className="text-gold">VAULT</span>
            <span className="text-white">EX</span>
          </div>
          <div className="text-[11px] tracking-widest text-white/40 mt-1.5">
            PREMIUM INVESTMENT PLATFORM
          </div>
        </div>

        <div className="px-8 py-10 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-5 h-10 w-10 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
              <h2 className="text-white text-lg font-bold mb-2">Verifying your email…</h2>
              <p className="text-white/50 text-sm">Hang tight, this only takes a second.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success text-2xl">
                ✓
              </div>
              <h2 className="text-white text-lg font-bold mb-2">You're verified! 🎉</h2>
              <p className="text-white/50 text-sm mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 rounded-[10px] font-bold text-sm text-navy-900 bg-gradient-to-br from-gold to-gold-dark hover:opacity-90 transition-opacity"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger text-2xl">
                ✕
              </div>
              <h2 className="text-white text-lg font-bold mb-2">Verification failed</h2>
              <p className="text-white/50 text-sm mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 rounded-[10px] font-bold text-sm text-white/80 border border-white/10 hover:border-white/20 transition-colors"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}