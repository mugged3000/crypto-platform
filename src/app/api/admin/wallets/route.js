
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const wallets = await prisma.walletAddress.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ wallets });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { method, label, address, network, instructions } = await request.json();

  const errors = {};
  if (!method)  errors.method  = 'Method is required';
  if (!label)   errors.label   = 'Label is required';
  if (!address) errors.address = 'Wallet address is required';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const wallet = await prisma.walletAddress.create({
    data: { method, label, address, network: network || null, instructions: instructions || null },
  });

  return NextResponse.json({ wallet }, { status: 201 });
}