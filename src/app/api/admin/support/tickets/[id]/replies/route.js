import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { message } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const [reply] = await prisma.$transaction([
    prisma.ticketReply.create({
      data: { ticketId: id, authorId: session.id, message: message.trim(), isAdminReply: true },
      include: { author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } },
    }),
    // An admin replying moves an OPEN ticket into IN_PROGRESS automatically
    // — gives a clear signal at a glance that someone's actively on it.
    prisma.supportTicket.update({
      where: { id },
      data: { status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status },
    }),
  ]);

  await logAudit({
    adminId: session.id,
    action: 'TICKET_REPLIED',
    targetType: 'SupportTicket',
    targetId: id,
    details: { subject: ticket.subject },
    request,
  });

  return NextResponse.json({ message: 'Reply sent', reply });
}
