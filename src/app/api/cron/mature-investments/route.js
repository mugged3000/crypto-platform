import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';

// This route is called by a cron job service (e.g. cron-job.org — free)
// It checks for investments that have passed their maturity date
// and marks them as ready for admin review.
// The admin still manually releases the profit — this just flags them.

export async function GET(request) {
  // Protect this route with a secret key
 const { searchParams } = new URL(request.url);
const secret = searchParams.get('secret');
const authHeader = request.headers.get('authorization');

// Allow both: ?secret= for local testing, and Authorization header for Vercel
if (secret !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all ACTIVE investments that have passed their maturity date
    const maturedInvestments = await prisma.investment.findMany({
      where: {
        status:      'ACTIVE',
        maturityDate: { lte: new Date() },
      },
      include: {
        user: { select: { id: true, firstName: true, email: true } },
      },
    });

    if (maturedInvestments.length === 0) {
      return NextResponse.json({ message: 'No matured investments found', count: 0 });
    }

    // Send notification to each user that their investment has matured
    // Admin will manually release the profit
    const notifications = maturedInvestments.map((inv) =>
      prisma.notification.upsert({
        where: {
          // Prevent duplicate notifications
          id: `maturity-${inv.id}`,
        },
        update: {},
        create: {
          id:      `maturity-${inv.id}`,
          userId:  inv.userId,
          type:    'INVESTMENT',
          title:   'Investment Matured!',
          message: `Your ${inv.planName} investment has reached its maturity date. Profit will be released to your balance shortly.`,
        },
      })
    );

    await Promise.allSettled(notifications);

    // Log to audit
    console.log(`[CRON] ${maturedInvestments.length} investments matured at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'Cron ran successfully',
      maturedCount: maturedInvestments.length,
      investments: maturedInvestments.map((inv) => ({
        id:          inv.id,
        planName:    inv.planName,
        user:        inv.user.email,
        maturityDate: inv.maturityDate,
      })),
    });

  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}