import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

// POST /api/admin/investments/:id/reject   body: { note }
// Moves the investment PENDING -> REJECTED and tells the user why.
// Nothing is refunded automatically, because the money never entered the
// user's balance (it was sent from an outside wallet).
export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body   = await request.json().catch(() => ({})); // tolerate an empty body
  const reason = typeof body?.note === 'string' && body.note.trim()
    ? body.note.trim().slice(0, 500)
    : 'Rejected by admin';

  try {
    const investment = await prisma.investment.findUnique({ where: { id } });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    if (investment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Investment is not pending' }, { status: 400 });
    }

    const { count } = await prisma.investment.updateMany({
      where: { id, status: 'PENDING' },
      data:  { status: 'REJECTED', adminNote: reason },
    });
    if (count === 0) {
      return NextResponse.json({ error: 'Investment is not pending' }, { status: 400 });
    }

    await logAudit({
      adminId:    session.id,
      action:     'INVESTMENT_REJECTED',
      targetType: 'Investment',
      targetId:   id,
      details:    { userId: investment.userId, planName: investment.planName, amount: investment.amount, note: reason },
      request,
    });

    try {
      await prisma.notification.create({
        data: {
          userId:  investment.userId,
          type:    'INVESTMENT',
          title:   'Investment Request Rejected',
          message: `Your $${(investment.amount / 100).toFixed(2)} investment request for the ${investment.planName} plan was rejected. Reason: ${reason}. If you already sent a payment, please contact support so we can sort it out.`,
          link:    '/dashboard/investments',
        },
      });
    } catch (err) {
      console.error('Investment rejection notification failed:', err);
    }

    return NextResponse.json({ message: 'Investment rejected' });
  } catch (error) {
    console.error('Reject investment error:', error);
    return NextResponse.json({ error: 'Could not reject investment' }, { status: 500 });
  }
}