import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

const STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED'];

// GET /api/admin/investments?status=PENDING — list investment requests.
// An unknown or missing status returns everything.
export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = new URL(request.url).searchParams.get('status');
  const where = STATUSES.includes(status) ? { status } : {};

  try {
    const investments = await prisma.investment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Admin investments list error:', error);
    return NextResponse.json({ error: 'Could not load investments' }, { status: 500 });
  }
}