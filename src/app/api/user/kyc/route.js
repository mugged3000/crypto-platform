import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

// Touches the filesystem, so this needs the Node runtime (not Edge).
export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB — ID photos are often larger than avatars
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'kyc');

// See the same note on src/app/api/user/avatar/route.js — this saves to the
// local filesystem, which is fine for local dev / learning but won't
// persist on serverless hosts. For real KYC documents specifically, you'd
// also want private object storage (not public/) since these are sensitive
// — this local setup is for learning the flow, not a production pattern.

async function saveFile(file, userId, label) {
  const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const filename = `${userId}-${label}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);
  return `/uploads/kyc/${filename}`;
}

export async function GET(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { kycStatus: true },
  });

  const submissions = await prisma.kycSubmission.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, docType: true, status: true, adminNote: true,
      createdAt: true, reviewedAt: true,
    },
  });

  return NextResponse.json({
    kycStatus: user?.kycStatus || 'NOT_SUBMITTED',
    submissions,
    latest: submissions[0] || null,
  });
}

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { kycStatus: true },
  });

  // Don't allow resubmitting while something's already pending, or after
  // it's already approved — only allowed from NOT_SUBMITTED, REJECTED, or
  // RESUBMIT_REQUESTED.
  if (user?.kycStatus === 'PENDING') {
    return NextResponse.json(
      { error: 'You already have a submission under review.' },
      { status: 409 }
    );
  }
  if (user?.kycStatus === 'APPROVED') {
    return NextResponse.json(
      { error: 'Your identity is already verified.' },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const docType   = formData.get('docType');
  const docFront  = formData.get('docFront');
  const docBack   = formData.get('docBack');
  const selfie    = formData.get('selfie');

  const errors = {};
  if (!docType) errors.docType = 'Please select a document type';
  if (!docFront || typeof docFront === 'string') errors.docFront = 'Front of document is required';
  if (!selfie || typeof selfie === 'string') errors.selfie = 'A selfie holding your document is required';

  for (const [key, file] of [['docFront', docFront], ['docBack', docBack], ['selfie', selfie]]) {
    if (file && typeof file !== 'string') {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors[key] = 'Must be a JPG, PNG, WEBP, or PDF';
      } else if (file.size > MAX_SIZE) {
        errors[key] = 'File must be under 5MB';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const docFrontUrl = await saveFile(docFront, session.id, 'front');
  const docBackUrl  = (docBack && typeof docBack !== 'string')
    ? await saveFile(docBack, session.id, 'back')
    : null;
  const selfieUrl   = await saveFile(selfie, session.id, 'selfie');

  const submission = await prisma.kycSubmission.create({
    data: {
      userId: session.id,
      docType,
      docFrontUrl,
      docBackUrl,
      selfieUrl,
      status: 'PENDING',
    },
  });

  await prisma.user.update({
    where: { id: session.id },
    data: { kycStatus: 'PENDING' },
  });

  return NextResponse.json({ message: 'Documents submitted for review', submission });
}
