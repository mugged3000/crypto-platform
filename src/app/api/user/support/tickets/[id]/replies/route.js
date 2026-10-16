import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const { message } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket || ticket.userId !== session.id) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  if (ticket.status === 'CLOSED') {
    return NextResponse.json(
      { error: 'This ticket is closed. Please open a new one.' },
      { status: 409 }
    );
  }

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId: id,
      authorId: session.id,
      message: message.trim(),
      isAdminReply: false,
    },
    include: { author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } },
  });

  // A user replying to a resolved ticket re-opens it — otherwise it'd sit
  // marked "Resolved" forever even though the conversation is still going.
  await prisma.supportTicket.update({
    where: { id },
    data: { status: ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status },
  });

  return NextResponse.json({ message: 'Reply sent', reply });
}
