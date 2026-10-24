import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id }  = await  params;
  const { txHash } = await request.json();

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (withdrawal.status !== 'PENDING') {
    return NextResponse.json({ error: 'Withdrawal is not pending' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.withdrawal.update({
      where: { id },
      data: {
        status:      'APPROVED',
        txHash:      txHash || null,
        processedBy: session.id,
        processedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: withdrawal.userId },
      data: { totalWithdrawn: { increment: withdrawal.amount } },
    }),
    prisma.auditLog.create({
      data: {
        adminId:    session.id,
        action:     'APPROVE_WITHDRAWAL',
        targetType: 'Withdrawal',
        targetId:   id,
        details:    { txHash },
      },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId:  withdrawal.userId,
      type:    'WITHDRAWAL',
      title:   'Withdrawal Processed!',
      message: `Your withdrawal of $${(withdrawal.netAmount / 100).toFixed(2)} via ${withdrawal.method} has been sent.${txHash ? ` TX: ${txHash}` : ''}`,
    },
  });

  return NextResponse.json({ message: 'Withdrawal approved' });
}