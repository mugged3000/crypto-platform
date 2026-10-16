import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { dollarsToCents } from '@/lib/currency';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const plans = await prisma.investmentPlan.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { investments: true } } },
  });

  return NextResponse.json({ plans });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, minAmount, maxAmount, rate, duration, sortOrder } = body;

  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  if (!minAmount || isNaN(parseFloat(minAmount))) errors.minAmount = 'Minimum amount is required';
  if (!rate || isNaN(parseFloat(rate))) errors.rate = 'Rate is required';
  if (!duration || isNaN(parseInt(duration))) errors.duration = 'Duration is required';
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const plan = await prisma.investmentPlan.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      minAmount: dollarsToCents(minAmount),
      maxAmount: maxAmount ? dollarsToCents(maxAmount) : null,
      rate: parseFloat(rate),
      duration: parseInt(duration),
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      isActive: true,
    },
  });

  await logAudit({
    adminId: session.id,
    action: 'PLAN_CREATED',
    targetType: 'InvestmentPlan',
    targetId: plan.id,
    details: { name: plan.name, rate: plan.rate, duration: plan.duration },
    request,
  });

  return NextResponse.json({ message: 'Plan created', plan });
}
