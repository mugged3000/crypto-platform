import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    totalUsers,
    pendingInvestments,
    pendingDeposits,
    pendingWithdrawals,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.investment.count({ where: { status: 'PENDING' } }),
    prisma.deposit.count({ where: { status: 'PENDING' } }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({
    totalUsers,
    pendingInvestments,
    pendingDeposits,
    pendingWithdrawals,
  });
}