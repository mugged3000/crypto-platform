import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const method = searchParams.get('method');

  const addresses = await prisma.walletAddress.findMany({
    where: { isActive: true, ...(method ? { method } : {}) },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ addresses });
}
