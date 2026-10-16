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
  const { note, allowResubmit } = await request.json();

  if (!note?.trim()) {
    return NextResponse.json({ error: 'A reason is required so the user knows what to fix' }, { status: 400 });
  }

  const submission = await prisma.kycSubmission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  // REJECTED is a harder stop; RESUBMIT_REQUESTED explicitly invites the
  // user to try again with the note as guidance — same DB action either
  // way, just a different resulting status shown to the user.
  const newStatus = allowResubmit ? 'RESUBMIT_REQUESTED' : 'REJECTED';

  const [updated] = await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id },
      data: { status: newStatus, reviewedBy: session.id, reviewedAt: new Date(), adminNote: note.trim() },
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: newStatus },
    }),
  ]);

  await logAudit({
    adminId: session.id,
    action: allowResubmit ? 'KYC_RESUBMIT_REQUESTED' : 'KYC_REJECTED',
    targetType: 'KycSubmission',
    targetId: id,
    details: { userId: submission.userId, note: note.trim() },
    request,
  });

  return NextResponse.json({ message: 'Submission updated', submission: updated });
}
