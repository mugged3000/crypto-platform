import { NextResponse } from 'next/server';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { firstName, lastName, phone } = await request.json();

  const errors = {};
  if (!firstName?.trim()) errors.firstName = 'First name is required';
  if (!lastName?.trim())  errors.lastName  = 'Last name is required';
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      phone:     phone?.trim() || null,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, avatarUrl: true, role: true,
    },
  });

  return NextResponse.json({ message: 'Profile updated', user });
}
