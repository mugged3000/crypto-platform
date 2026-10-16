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

  const submission = await prisma.kycSubmission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const [updated] = await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: session.id, reviewedAt: new Date(), adminNote: null },
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: 'APPROVED' },
    }),
  ]);

  await logAudit({
    adminId: session.id,
    action: 'KYC_APPROVED',
    targetType: 'KycSubmission',
    targetId: id,
    details: { userId: submission.userId, docType: submission.docType },
    request,
  });

  return NextResponse.json({ message: 'KYC approved', submission: updated });
}
