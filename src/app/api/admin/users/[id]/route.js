import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { dollarsToCents } from '@/lib/currency';

export async function GET(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true, country: true,
      avatarUrl: true, status: true, kycStatus: true, emailVerified: true,
      balance: true, totalDeposited: true, totalWithdrawn: true, totalProfit: true,
      canDeposit: true, canWithdraw: true, canInvest: true,
      referralCode: true, lastLoginAt: true, createdAt: true,
      _count: { select: { investments: true, deposits: true, withdrawals: true, tickets: true, referrals: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ user, recentTransactions });
}

export async function PATCH(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, canDeposit, canWithdraw, canInvest, balanceAdjustment, adjustmentNote } = body;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: "Can't moderate another admin account" }, { status: 403 });
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (canDeposit !== undefined) updateData.canDeposit = canDeposit;
  if (canWithdraw !== undefined) updateData.canWithdraw = canWithdraw;
  if (canInvest !== undefined) updateData.canInvest = canInvest;

  let adjustmentCents = 0;
  if (balanceAdjustment !== undefined && balanceAdjustment !== '' && !isNaN(parseFloat(balanceAdjustment))) {
    adjustmentCents = dollarsToCents(balanceAdjustment); // can be negative to deduct
    updateData.balance = target.balance + adjustmentCents;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id }, data: updateData });

    if (adjustmentCents !== 0) {
      await tx.transaction.create({
        data: {
          userId: id,
          type: 'ADJUSTMENT',
          amount: adjustmentCents,
          balanceBefore: target.balance,
          balanceAfter: updated.balance,
          description: adjustmentNote?.trim() || 'Manual balance adjustment by admin',
        },
      });
    }

    return updated;
  });

  await logAudit({
    adminId: session.id,
    action: 'USER_UPDATED',
    targetType: 'User',
    targetId: id,
    details: { ...body, targetEmail: target.email },
    request,
  });

  return NextResponse.json({ message: 'User updated', user: result });
}
