import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'PENDING';

  const deposits = await prisma.deposit.findMany({
    where: status === 'ALL' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true, firstName: true,
          lastName: true, email: true,
        },
      },
      walletAddress: {
        select: { label: true, address: true, network: true },
      },
    },
  });

  return NextResponse.json({ deposits });
}