import prisma from '@/lib/prismakey';

// Every admin action that changes something (approving KYC, suspending a
// user, editing a plan, etc.) should call this so there's a traceable
// record of who did what. Deliberately fire-and-forget on failure — an
// audit log write failing should never block the actual admin action from
// completing, just get logged to the server console instead.
export async function logAudit({ adminId, action, targetType, targetId, details, request }) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details || undefined,
        ipAddress: request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
          || request?.headers?.get('x-real-ip')
          || null,
      },
    });
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}
