import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { dollarsToCents } from '@/lib/currency';

export async function PATCH(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, description, minAmount, maxAmount, rate, duration, sortOrder, isActive } = body;

  const existing = await prisma.investmentPlan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  const plan = await prisma.investmentPlan.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(minAmount !== undefined ? { minAmount: dollarsToCents(minAmount) } : {}),
      ...(maxAmount !== undefined ? { maxAmount: maxAmount ? dollarsToCents(maxAmount) : null } : {}),
      ...(rate !== undefined ? { rate: parseFloat(rate) } : {}),
      ...(duration !== undefined ? { duration: parseInt(duration) } : {}),
      ...(sortOrder !== undefined ? { sortOrder: parseInt(sortOrder) } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });

  await logAudit({
    adminId: session.id,
    action: isActive !== undefined ? (isActive ? 'PLAN_ACTIVATED' : 'PLAN_DEACTIVATED') : 'PLAN_UPDATED',
    targetType: 'InvestmentPlan',
    targetId: plan.id,
    details: body,
    request,
  });

  return NextResponse.json({ message: 'Plan updated', plan });
}

export async function DELETE(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.investmentPlan.findUnique({
    where: { id },
    include: { _count: { select: { investments: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  // Plans that already have investments against them can't be hard-deleted
  // (would orphan those Investment rows' foreign key) — deactivate instead,
  // which just hides it from users without touching history.
  if (existing._count.investments > 0) {
    const plan = await prisma.investmentPlan.update({
      where: { id },
      data: { isActive: false },
    });
    await logAudit({
      adminId: session.id, action: 'PLAN_DEACTIVATED', targetType: 'InvestmentPlan',
      targetId: id, details: { reason: 'Has existing investments, deactivated instead of deleted' }, request,
    });
    return NextResponse.json({
      message: 'Plan has existing investments — deactivated instead of deleted',
      plan,
    });
  }

  await prisma.investmentPlan.delete({ where: { id } });

  await logAudit({
    adminId: session.id, action: 'PLAN_DELETED', targetType: 'InvestmentPlan',
    targetId: id, details: { name: existing.name }, request,
  });

  return NextResponse.json({ message: 'Plan deleted' });
}
