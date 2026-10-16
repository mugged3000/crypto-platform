import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } },
      },
    },
  });

  // Ownership check — a user should only ever see their own tickets, not
  // guess someone else's ticket ID and read their support conversation.
  if (!ticket || ticket.userId !== session.id) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}
