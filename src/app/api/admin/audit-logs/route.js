import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const targetType = searchParams.get('targetType');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 40;

  const where = {
    ...(action && action !== 'ALL' ? { action } : {}),
    ...(targetType && targetType !== 'ALL' ? { targetType } : {}),
  };

  const [logs, total, distinctActions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { admin: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    availableActions: distinctActions.map((a) => a.action),
  });
}
