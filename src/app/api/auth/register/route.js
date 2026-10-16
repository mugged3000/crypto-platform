import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '@/lib/prismakey'
import { sendVerificationEmail } from '@/lib/email';

// Generate unique referral code
async function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;

  while (exists) {
    code = 'REF-' + Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    const found = await prisma.user.findUnique({ where: { referralCode: code } });
    exists = !!found;
  }

  return code;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      country,
      referralCode,
    } = body;

    // ── Validation ──────────────────────────────────────
    const errors = {};

    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim())  errors.lastName  = 'Last name is required';
    if (!country?.trim())   errors.country   = 'Country is required';

    if (!email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // ── Check existing email ─────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { errors: { email: 'An account with this email already exists' } },
        { status: 409 }
      );
    }

    // ── Find referrer ────────────────────────────────────
    let referredById = null;
    if (referralCode?.trim()) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim().toUpperCase() },
      });
      if (referrer) referredById = referrer.id;
    }

    // ── Hash password ────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Generate referral code ───────────────────────────
    const newReferralCode = await generateReferralCode();

    // ── Create user + verification token ─────────────────
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName:    firstName.trim(),
          lastName:     lastName.trim(),
          email:        email.toLowerCase().trim(),
          passwordHash,
          phone:        phone?.trim() || null,
          country:      country.trim(),
          referralCode: newReferralCode,
          referredById,
        },
      });

      await tx.emailVerification.create({
        data: {
          userId:    newUser.id,
          token:     verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      if (referredById) {
        await tx.referral.create({
          data: {
            referrerId:      referredById,
            refereeId:       newUser.id,
            commissionRate:  parseFloat(process.env.REFERRAL_COMMISSION_RATE || '5'),
          },
        });
      }

      return newUser;
    });

    // ── Send verification email ──────────────────────────
    try {
      await sendVerificationEmail(user.email, user.firstName, verificationToken);
      console.log('✅ Verification email sent to', user.email);
    } catch (emailError) {
      // Logging the full error (not just .message) — SMTP failures carry
      // useful info in .code (e.g. EAUTH, ECONNREFUSED, ETIMEDOUT) and
      // .command that .message alone often doesn't show.
      console.error('❌ Email send failed:');
      console.error('   code:', emailError.code);
      console.error('   command:', emailError.command);
      console.error('   message:', emailError.message);
      // Still not failing registration — the account was created either way —
      // but now you'll actually see WHY the email didn't go out.
    }

    return NextResponse.json(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        email: user.email,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}