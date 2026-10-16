import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'investments');

// GET — fetch user's investment history
export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const investments = await prisma.investment.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      plan: { select: { name: true, rate: true, duration: true } },
    },
  });

  return NextResponse.json({ investments });
}

// POST — user submits a new investment request
// Money comes from OUTSIDE (crypto wallet) — no balance deduction here.
// Admin confirms receipt and manually credits the user's dashboard.
export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const planId     = formData.get('planId');
    const amountStr  = formData.get('amount');
    const method     = formData.get('method');
    const txHash     = formData.get('txHash');
    const proof      = formData.get('proof');

    // ── Validation ──────────────────────────────────────────
    const errors = {};

    if (!planId) {
      errors.planId = 'Please select an investment plan';
    }

    const amount = Math.round(parseFloat(amountStr || 0) * 100);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      errors.amount = 'Enter the amount you sent';
    }

    if (!method) {
      errors.method = 'Please select the payment method you used';
    }

    if (!proof || typeof proof === 'string') {
      errors.proof = 'Payment screenshot is required';
    } else {
      if (!ALLOWED_TYPES.includes(proof.type)) {
        errors.proof = 'Must be JPG, PNG, WEBP or PDF';
      } else if (proof.size > MAX_SIZE) {
        errors.proof = 'File must be under 5MB';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // ── Check plan exists ────────────────────────────────────
    const plan = await prisma.investmentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'This plan is no longer available.' },
        { status: 400 }
      );
    }

    // ── Validate amount against plan limits ──────────────────
    if (amount < plan.minAmount) {
      return NextResponse.json(
        { error: `Minimum investment for this plan is $${(plan.minAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    if (plan.maxAmount && amount > plan.maxAmount) {
      return NextResponse.json(
        { error: `Maximum investment for this plan is $${(plan.maxAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    // ── Save proof screenshot ────────────────────────────────
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = proof.type === 'application/pdf' ? 'pdf' : proof.type.split('/')[1];
    const filename = `${session.id}-${Date.now()}.${ext}`;
    await writeFile(
      path.join(UPLOAD_DIR, filename),
      Buffer.from(await proof.arrayBuffer())
    );
    const proofImageUrl = `/uploads/investments/${filename}`;

    // ── Pre-calculate expected profit (display only) ─────────
    // These are estimates shown to the user.
    // Admin controls the actual payout amount manually.
    const expectedProfit = Math.round(amount * (plan.rate / 100));
    const expectedReturn = amount + expectedProfit;

    // ── Create investment record ─────────────────────────────
    // Status = PENDING — admin must approve this manually.
    // NO balance deduction happens here.
    // Balance only changes when admin seeds/releases funds.
    const investment = await prisma.investment.create({
      data: {
        userId:         session.id,
        planId:         plan.id,
        planName:       plan.name,
        amount,
        rate:           plan.rate,
        expectedProfit,
        expectedReturn,
        proofImageUrl,
        txHash:         txHash || null,
        status:         'PENDING',
        // startDate and maturityDate are set by admin on approval
      },
    });

    // ── Notify admin ─────────────────────────────────────────
    // Non-critical — don't fail the request if email fails
    try {
      const { sendAdminNotification } = await import('@/lib/email');
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { firstName: true, lastName: true, email: true },
      });
      await sendAdminNotification(
        `New Investment Request — $${(amount / 100).toFixed(2)}`,
        `
          <h2>New Investment Request</h2>
          <p>
            <strong>${user.firstName} ${user.lastName}</strong> (${user.email})
            has submitted an investment request.
          </p>
          <ul style="margin:16px 0 0 20px;line-height:2;color:#9898b8">
            <li>Plan: <strong style="color:#f0f0fa">${plan.name}</strong></li>
            <li>Amount: <strong style="color:#c9a84c">$${(amount / 100).toFixed(2)}</strong></li>
            <li>Method: <strong style="color:#f0f0fa">${method}</strong></li>
            ${txHash ? `<li>TX Hash: <code style="color:#f0f0fa">${txHash}</code></li>` : ''}
          </ul>
          <p style="margin-top:20px">
            Review it in the 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/investments" style="color:#c9a84c">
              admin dashboard
            </a>.
          </p>
        `
      );
    } catch (e) {
      console.error('Admin notification failed:', e.message);
    }

    return NextResponse.json(
      {
        message: 'Investment request submitted. Admin will confirm your payment shortly.',
        investment,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Investment submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}