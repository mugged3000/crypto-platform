import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id }   = params;
  const { note } = await request.json();

  const deposit = await prisma.deposit.findUnique({ where: { id } });
  if (!deposit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (deposit.status !== 'PENDING') {
    return NextResponse.json({ error: 'Deposit is not pending' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.deposit.update({
      where: { id },
      data: {
        status:    'REJECTED',
        adminNote: note || 'Rejected by admin',
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId:    session.id,
        action:     'REJECT_DEPOSIT',
        targetType: 'Deposit',
        targetId:   id,
        details:    { note },
      },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId:  deposit.userId,
      type:    'DEPOSIT',
      title:   'Deposit Rejected',
      message: note || 'Your deposit request was rejected. Contact support for details.',
    },
  });

  return NextResponse.json({ message: 'Deposit rejected' });
}