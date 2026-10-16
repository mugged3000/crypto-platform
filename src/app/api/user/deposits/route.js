import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'deposits');

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const deposits = await prisma.deposit.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { walletAddress: { select: { label: true, address: true, network: true } } },
  });

  return NextResponse.json({ deposits });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { canDeposit: true },
  });
  if (user && !user.canDeposit) {
    return NextResponse.json(
      { error: 'Deposits are currently disabled on your account. Contact support.' },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const amountDollars   = formData.get('amount');
  const method          = formData.get('method');
  const walletAddressId = formData.get('walletAddressId');
  const txHash          = formData.get('txHash');
  const proof           = formData.get('proof');

  const errors = {};
  const amount = Math.round(parseFloat(amountDollars || 0) * 100);
  if (!amountDollars || isNaN(amount) || amount < 100) {
    errors.amount = 'Minimum deposit is $1.00';
  }
  if (!method) errors.method = 'Please select a payment method';
  if (!proof || typeof proof === 'string') {
    errors.proof = 'Proof of payment (screenshot/receipt) is required';
  } else {
    if (!ALLOWED_TYPES.includes(proof.type)) errors.proof = 'Must be a JPG, PNG, WEBP, or PDF';
    else if (proof.size > MAX_SIZE) errors.proof = 'File must be under 5MB';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = proof.type === 'application/pdf' ? 'pdf' : proof.type.split('/')[1];
  const filename = `${session.id}-${Date.now()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await proof.arrayBuffer()));
  const proofImageUrl = `/uploads/deposits/${filename}`;

  const deposit = await prisma.deposit.create({
    data: {
      userId: session.id,
      amount,
      method,
      walletAddressId: walletAddressId || null,
      txHash: txHash || null,
      proofImageUrl,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ message: 'Deposit submitted for review', deposit });
}
