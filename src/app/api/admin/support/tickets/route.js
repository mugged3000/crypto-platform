import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const tickets = await prisma.supportTicket.findMany({
    where: status && status !== 'ALL' ? { status } : {},
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({ tickets });
}
