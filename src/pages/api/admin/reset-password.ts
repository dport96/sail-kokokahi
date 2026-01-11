import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  // Only admins allowed
  const role = (session?.user as any)?.randomKey;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId } = req.body;
  if (typeof userId !== 'number') {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const newPassword = 'changeme!';
    const hashed = await hash(newPassword, 10);

    // Try updating password and setting mustChangePassword flag. If the DB
    // doesn't have the column yet (migration not applied), fall back to
    // updating only the password so the reset still works.
    try {
      // Update password and require user to change it on next login
      await prisma.user.update({ where: { id: userId }, data: { password: hashed, mustChangePassword: true } });
    } catch (e) {
      // Keep a fallback to raw SQL in case of unexpected regressions in environments
      console.warn('Typed update failed, falling back to raw SQL password update.', e);
      try {
        await prisma.$executeRawUnsafe('UPDATE "public"."User" SET password = $1, "mustChangePassword" = true WHERE id = $2', hashed, userId);
      } catch (errFallback) {
        console.error('Fallback password update also failed:', errFallback);
        return res.status(500).json({ error: 'Failed to reset password' });
      }
    }

    const updated = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    return res.status(200).json({ ok: true, user: updated });
  } catch (error) {
    console.error('Reset password failed:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
