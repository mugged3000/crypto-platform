import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;

  const deposit = await prisma.deposit.findUnique({
    where: { id },
    include: { user: { select: { balance: true, totalDeposited: true } } },
  });

  if (!deposit) {
    return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
  }
  if (deposit.status !== 'PENDING') {
    return NextResponse.json({ error: 'Deposit is not pending' }, { status: 400 });
  }

  const newBalance       = deposit.user.balance + deposit.amount;
  const newTotalDeposited = deposit.user.totalDeposited + deposit.amount;

  await prisma.$transaction([
    // Credit user balance
    prisma.user.update({
      where: { id: deposit.userId },
      data: {
        balance:        newBalance,
        totalDeposited: newTotalDeposited,
      },
    }),
    // Mark deposit approved
    prisma.deposit.update({
      where: { id },
      data: {
        status:     'APPROVED',
        approvedBy: session.id,
        approvedAt: new Date(),
      },
    }),
    // Transaction record
    prisma.transaction.create({
      data: {
        userId:        deposit.userId,
        type:          'DEPOSIT',
        amount:        deposit.amount,
        balanceBefore: deposit.user.balance,
        balanceAfter:  newBalance,
        description:   `Deposit approved — ${deposit.method}`,
        referenceId:   id,
      },
    }),
    // Audit log
    prisma.auditLog.create({
      data: {
        adminId:    session.id,
        action:     'APPROVE_DEPOSIT',
        targetType: 'Deposit',
        targetId:   id,
        details:    { amount: deposit.amount },
      },
    }),
  ]);

  // In-app notification
  await prisma.notification.create({
    data: {
      userId:  deposit.userId,
      type:    'DEPOSIT',
      title:   'Deposit Approved!',
      message: `Your deposit of $${(deposit.amount / 100).toFixed(2)} via ${deposit.method} has been approved and credited to your balance.`,
    },
  });

  return NextResponse.json({ message: 'Deposit approved', newBalance });
}