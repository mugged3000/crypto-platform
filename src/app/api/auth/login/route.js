import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prismakey';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always run bcrypt even if user not found
    // This prevents timing attacks
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding';
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isValid) {
      // Record failed attempt if user exists
      if (user) {
        await prisma.loginHistory.create({
          data: {
            userId:    user.id,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            successful: false,
          },
        });
      }
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in.' },
        { status: 403 }
      );
    }

    // Check account status
    if (user.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Your account has been banned. Contact support.' },
        { status: 403 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account is suspended. Contact support.' },
        { status: 403 }
      );
    }

    // Record successful login
    await prisma.loginHistory.create({
      data: {
        userId:    user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        successful: true,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date() },
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id:    user.id,
        email: user.email,
        role:  user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return token + safe user data
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id:           user.id,
        email:        user.email,
        firstName:    user.firstName,
        lastName:     user.lastName,
        role:         user.role,
        emailVerified: user.emailVerified,
        kycStatus:    user.kycStatus,
        balance:      user.balance,
        referralCode: user.referralCode,
      },
    });

    // Also set token as httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}