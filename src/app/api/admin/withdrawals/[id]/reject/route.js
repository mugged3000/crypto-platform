import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id }  = await  params;
  const { note } = await request.json();

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    include: { user: { select: { balance: true } } },
  });

  if (!withdrawal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (withdrawal.status !== 'PENDING') {
    return NextResponse.json({ error: 'Not pending' }, { status: 400 });
  }

  // Refund the amount back to user balance
  const newBalance = withdrawal.user.balance + withdrawal.amount;

  await prisma.$transaction([
    prisma.withdrawal.update({
      where: { id },
      data: {
        status:      'REJECTED',
        adminNote:   note || 'Rejected by admin',
        processedBy: session.id,
        processedAt: new Date(),
      },
    }),
    // Refund balance
    prisma.user.update({
      where: { id: withdrawal.userId },
      data: { balance: newBalance },
    }),
    // Refund transaction record
    prisma.transaction.create({
      data: {
        userId:        withdrawal.userId,
        type:          'REFUND',
        amount:        withdrawal.amount,
        balanceBefore: withdrawal.user.balance,
        balanceAfter:  newBalance,
        description:   `Withdrawal rejected — refunded`,
        referenceId:   id,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId:    session.id,
        action:     'REJECT_WITHDRAWAL',
        targetType: 'Withdrawal',
        targetId:   id,
        details:    { note },
      },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId:  withdrawal.userId,
      type:    'WITHDRAWAL',
      title:   'Withdrawal Rejected',
      message: `Your withdrawal of $${(withdrawal.amount / 100).toFixed(2)} was rejected and refunded to your balance. ${note || ''}`,
    },
  });

  return NextResponse.json({ message: 'Withdrawal rejected and refunded' });
}