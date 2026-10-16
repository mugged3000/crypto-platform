import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { calculateWithdrawalFee } from '@/lib/paymentMethods';

const MIN_WITHDRAWAL_CENTS = 1000; // $10.00 — adjust as needed

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ withdrawals });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { amount: amountDollars, method, walletAddress } = await request.json();

  const errors = {};
  const amount = Math.round(parseFloat(amountDollars || 0) * 100);
  if (!amountDollars || isNaN(amount) || amount < MIN_WITHDRAWAL_CENTS) {
    errors.amount = `Minimum withdrawal is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}`;
  }
  if (!method) errors.method = 'Please select a payment method';
  if (!walletAddress?.trim()) errors.walletAddress = 'Destination wallet address is required';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const networkFee = calculateWithdrawalFee(amount, method);
  const netAmount = amount - networkFee;

  if (netAmount <= 0) {
    return NextResponse.json(
      { error: 'Amount is too small to cover network fees.' },
      { status: 400 }
    );
  }

  try {
    // Funds are held (deducted) the moment a withdrawal is REQUESTED, not
    // when it's approved — this prevents someone from submitting several
    // withdrawal requests that together exceed their real balance while
    // all of them sit PENDING. If an admin later rejects the request, the
    // amount needs to be refunded back to the user's balance at that point
    // (that refund flow lives on the admin side, not built here).
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.id },
        select: { balance: true, canWithdraw: true },
      });

      if (!user) throw new Error('USER_NOT_FOUND');
      if (!user.canWithdraw) throw new Error('WITHDRAWALS_DISABLED');
      if (user.balance < amount) throw new Error('INSUFFICIENT_BALANCE');

      const newBalance = user.balance - amount;

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: session.id,
          amount,
          method,
          walletAddress: walletAddress.trim(),
          networkFee,
          netAmount,
          status: 'PENDING',
        },
      });

      await tx.user.update({
        where: { id: session.id },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId: session.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          description: `Withdrawal request — ${method}`,
          referenceId: withdrawal.id,
        },
      });

      return { withdrawal, newBalance };
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted',
      withdrawal: result.withdrawal,
      balance: result.newBalance,
    });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({ error: 'Insufficient balance for this withdrawal.' }, { status: 400 });
    }
    if (err.message === 'WITHDRAWALS_DISABLED') {
      return NextResponse.json({ error: 'Withdrawals are currently disabled on your account. Contact support.' }, { status: 403 });
    }
    console.error('Withdrawal error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
