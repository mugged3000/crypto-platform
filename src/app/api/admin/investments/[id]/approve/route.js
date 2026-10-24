import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

const DAY_MS = 24 * 60 * 60 * 1000;

// POST /api/admin/investments/:id/approve
// The user paid from an outside wallet, so nothing is deducted from or added
// to their balance here. Approving confirms the payment was received: it moves
// the investment PENDING -> ACTIVE and sets the start and maturity dates.
export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { plan: { select: { duration: true } } },
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    if (investment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Investment is not pending' }, { status: 400 });
    }

    const startDate    = new Date();
    const maturityDate = new Date(startDate.getTime() + investment.plan.duration * DAY_MS); // duration is in days

    // The status check is part of the update itself, so if two admins click
    // at the same moment only one of them succeeds.
    const { count } = await prisma.investment.updateMany({
      where: { id, status: 'PENDING' },
      data:  { status: 'ACTIVE', startDate, maturityDate, adminNote: null },
    });
    if (count === 0) {
      return NextResponse.json({ error: 'Investment is not pending' }, { status: 400 });
    }

    await logAudit({
      adminId:    session.id,
      action:     'INVESTMENT_APPROVED',
      targetType: 'Investment',
      targetId:   id,
      details:    { userId: investment.userId, planName: investment.planName, amount: investment.amount },
      request,
    });

    // The approval is already saved; a failed notification shouldn't undo it.
    try {
      const maturesOn = maturityDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      await prisma.notification.create({
        data: {
          userId:  investment.userId,
          type:    'INVESTMENT',
          title:   'Investment Approved',
          message: `Your $${(investment.amount / 100).toFixed(2)} investment in the ${investment.planName} plan has been approved and is now active. It matures on ${maturesOn}.`,
          link:    '/dashboard/investments',
        },
      });
    } catch (err) {
      console.error('Investment approval notification failed:', err);
    }

    return NextResponse.json({ message: 'Investment approved', startDate, maturityDate });
  } catch (error) {
    console.error('Approve investment error:', error);
    return NextResponse.json({ error: 'Could not approve investment' }, { status: 500 });
  }
}