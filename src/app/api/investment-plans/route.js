import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const plans = await prisma.investmentPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ plans });
}
