import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export async function GET(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { status },
  });

  await logAudit({
    adminId: session.id,
    action: 'TICKET_STATUS_CHANGED',
    targetType: 'SupportTicket',
    targetId: id,
    details: { from: existing.status, to: status, subject: existing.subject },
    request,
  });

  return NextResponse.json({ message: 'Ticket updated', ticket });
}
