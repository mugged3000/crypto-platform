import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // optional filter, e.g. 'DEPOSIT'

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.id, ...(type && type !== 'ALL' ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ transactions });
}
