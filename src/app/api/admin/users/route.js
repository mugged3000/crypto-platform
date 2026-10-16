import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 25;

  const where = {
    role: 'USER',
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
        status: true, kycStatus: true, balance: true, emailVerified: true,
        createdAt: true, lastLoginAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users, total, page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
