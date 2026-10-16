import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get user's referral code
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      referralCode: true,
      firstName:    true,
    },
  });

  // Get all people this user referred
  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      referee: {
        select: {
          firstName:  true,
          lastName:   true,
          email:      true,
          createdAt:  true,
          kycStatus:  true,
        },
      },
    },
  });

  // Stats
  const totalReferrals      = referrals.length;
  const paidReferrals       = referrals.filter((r) => r.isPaid);
  const totalEarned         = paidReferrals.reduce((sum, r) => sum + r.commissionEarned, 0);
  const pendingCommission   = referrals
    .filter((r) => !r.isPaid)
    .reduce((sum, r) => sum + r.commissionEarned, 0);

  return NextResponse.json({
    referralCode:     user.referralCode,
    referralLink:     `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.referralCode}`,
    totalReferrals,
    totalEarned,
    pendingCommission,
    referrals,
  });
}