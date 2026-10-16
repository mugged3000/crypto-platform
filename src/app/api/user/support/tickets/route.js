import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

const CATEGORIES = ['Account', 'Deposit', 'Withdrawal', 'Investment', 'KYC', 'Other'];

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, subject: true, category: true, status: true,
      createdAt: true, updatedAt: true,
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { subject, category, message } = await request.json();

  const errors = {};
  if (!subject?.trim()) errors.subject = 'Subject is required';
  if (!category || !CATEGORIES.includes(category)) errors.category = 'Please select a valid category';
  if (!message?.trim()) errors.message = 'Please describe your issue';
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // SupportTicket only holds metadata (subject/category/status) — the
  // actual message content lives as the first TicketReply, same as every
  // reply after it. Keeps one consistent shape for the whole conversation
  // instead of a special-cased "first message" field.
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.id,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      replies: {
        create: {
          authorId: session.id,
          message: message.trim(),
          isAdminReply: false,
        },
      },
    },
    include: { replies: true },
  });

  return NextResponse.json({ message: 'Ticket created', ticket });
}
