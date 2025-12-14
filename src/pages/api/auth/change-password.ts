import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { compare, hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const email = String(session.user.email).trim().toLowerCase();
  const { oldPassword, newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: 'Missing new password' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If user is NOT forced to change password, verify old password
    if (!user.mustChangePassword) {
      if (!oldPassword) return res.status(400).json({ error: 'Current password is required' });
      const isValid = await compare(String(oldPassword), user.password);
      if (!isValid) return res.status(403).json({ error: 'Current password is incorrect' });
    }

    const hashed = await hash(String(newPassword), 10);
    // Update password and clear mustChangePassword flag using typed Prisma
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, mustChangePassword: false } });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Change password failed:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}
