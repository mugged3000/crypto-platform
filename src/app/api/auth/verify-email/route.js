import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find token
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification link' },
        { status: 400 }
      );
    }

    if (verification.usedAt) {
      return NextResponse.json(
        { error: 'This link has already been used' },
        { status: 400 }
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark verified
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data:  { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data:  { emailVerified: true },
      }),
    ]);

    // Send welcome email
    try {
      await sendWelcomeEmail(verification.user.email, verification.user.firstName);
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return NextResponse.json({
      message: 'Email verified successfully! You can now log in.',
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}