import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prismakey';
import { getUserFromRequest } from '@/lib/auth';

// Needs the Node.js runtime (not Edge) because it touches the filesystem.
export const runtime = 'nodejs';

const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');

// NOTE for later: this saves files to the local filesystem under /public,
// which is simple and works great for local dev / learning purposes. It
// will NOT persist on most serverless hosts (Vercel, etc.) since their
// filesystem is ephemeral/read-only at runtime. When you're ready to deploy
// for real, swap this for an object storage service (S3, Cloudinary,
// Vercel Blob) — the DB just stores a URL either way, so the rest of the
// app (avatarUrl field, <img> tags) doesn't need to change.

export async function POST(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Please upload a JPG, PNG, WEBP, or GIF image.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Image must be under 3MB.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type.split('/')[1];
  const filename = `${session.id}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  const newAvatarUrl = `/uploads/avatars/${filename}`;

  // Clean up the old avatar file so we don't accumulate orphaned images
  // every time someone changes their photo.
  if (user?.avatarUrl?.startsWith('/uploads/avatars/')) {
    const oldPath = path.join(process.cwd(), 'public', user.avatarUrl);
    await unlink(oldPath).catch(() => {}); // fine if it's already gone
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { avatarUrl: newAvatarUrl },
    select: { avatarUrl: true },
  });

  return NextResponse.json({ message: 'Avatar updated', avatarUrl: updated.avatarUrl });
}

export async function DELETE(request) {
  const session = getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { avatarUrl: true },
  });

  if (user?.avatarUrl?.startsWith('/uploads/avatars/')) {
    const oldPath = path.join(process.cwd(), 'public', user.avatarUrl);
    await unlink(oldPath).catch(() => {});
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { avatarUrl: null },
  });

  return NextResponse.json({ message: 'Avatar removed' });
}
