import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data   = await request.json();
  const wallet = await prisma.walletAddress.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ wallet });
}

export async function DELETE(request, { params }) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.walletAddress.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Wallet address deleted' });
}