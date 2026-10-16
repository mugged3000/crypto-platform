import { NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';

const TOPICS = [
  'General question',
  'Account & login',
  'Deposits & withdrawals',
  'Investment plans',
  'Identity verification (KYC)',
  'Compliance / report a concern',
  'Partnership or press',
];

// Light in-memory throttle: 5 messages per IP per 15 minutes. This resets on
// restart (and per instance on serverless), so it only slows casual abuse —
// put a real rate limiter in front of this route if spam becomes a problem.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function tooManyRequests(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const topic = String(body?.topic || '').trim();
  const message = String(body?.message || '').trim();
  const honeypot = String(body?.website || '').trim();

  // Bots fill the hidden field. Pretend it worked so they don't retry.
  if (honeypot) return NextResponse.json({ success: true });

  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = 'Please enter your name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) errors.email = 'Please enter a valid email address';
  if (message.length < 10) errors.message = 'Please write at least a few words (10+ characters)';
  if (message.length > 3000) errors.message = 'Message is too long (3000 characters max)';
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (tooManyRequests(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

  const safeTopic = TOPICS.includes(topic) ? topic : 'General question';
  // Strip line breaks so user input can never inject extra email headers.
  const subject = `[Contact] ${safeTopic} — ${name}`.replace(/[\r\n]+/g, ' ').slice(0, 200);

  try {
    await sendAdminNotification(
      subject,
      `
        <h2>New contact message</h2>
        <p><strong style="color:#f0f0fa">From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong style="color:#f0f0fa">Topic:</strong> ${escapeHtml(safeTopic)}</p>
        <p style="margin-top:16px;white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
      { replyTo: email }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form email failed:', err);
    return NextResponse.json(
      { error: 'We could not send your message right now. Please email us directly instead.' },
      { status: 500 }
    );
  }
}