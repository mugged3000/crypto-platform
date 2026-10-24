import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

const MAX_INT = 2147483647; // the balance column is a 32-bit integer (in cents)

// POST /api/admin/investments/:id/seed   body: { amount, note }   (amount in dollars)
//
// TEST TOOL: credits dummy funds to the user's balance so the dashboard can be
// tried out. It is switched off in production builds on purpose, and every
// credit is labelled "test credit" in the user's transaction history and
// notification, so it can never pass for real money.
export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

   // In production this stays off unless it was switched on deliberately.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_CREDITS !== 'true') {
    return NextResponse.json(
      { error: 'Test credits are switched off on this server. Set ALLOW_TEST_CREDITS=true to turn them on.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body   = await request.json().catch(() => ({}));

  const dollars = parseFloat(body?.amount);
  const cents   = Math.round(dollars * 100);
  if (!Number.isFinite(cents) || cents <= 0) {
    return NextResponse.json({ error: 'Enter a valid amount greater than 0' }, { status: 400 });
  }
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 200) : '';

  try {
    const investment = await prisma.investment.findUnique({
      where:   { id },
      include: { user: { select: { balance: true } } },
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }
    if (investment.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active investments can be seeded' }, { status: 400 });
    }

    const balanceBefore = investment.user.balance;
    const balanceAfter  = balanceBefore + cents;
    if (balanceAfter > MAX_INT || investment.seededAmount + cents > MAX_INT) {
      return NextResponse.json({ error: 'That amount is too large' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: investment.userId },
        data:  { balance: { increment: cents } },
      }),
      prisma.investment.update({
        where: { id },
        data:  { seededAmount: { increment: cents } },
      }),
      prisma.transaction.create({
        data: {
          userId:        investment.userId,
          type:          'ADJUSTMENT',
          amount:        cents,
          balanceBefore,
          balanceAfter,
          description:   `Test credit (not real funds) — ${investment.planName}${note ? `: ${note}` : ''}`,
          referenceId:   id,
        },
      }),
    ]);

    await logAudit({
      adminId:    session.id,
      action:     'INVESTMENT_SEEDED',
      targetType: 'Investment',
      targetId:   id,
      details:    { userId: investment.userId, amount: cents, note },
      request,
    });

    try {
      await prisma.notification.create({
        data: {
          userId:  investment.userId,
          type:    'INVESTMENT',
          title:   'Test Credit Added',
          message: `A test credit of $${(cents / 100).toFixed(2)} was added to your balance. This is test data, not real funds.`,
          link:    '/dashboard/investments',
        },
      });
    } catch (err) {
      console.error('Seed notification failed:', err);
    }

    return NextResponse.json({ message: 'Test credit added', newBalance: balanceAfter });
  } catch (error) {
    console.error('Seed investment error:', error);
    return NextResponse.json({ error: 'Could not add the test credit' }, { status: 500 });
  }
}