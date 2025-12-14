import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // Use Prisma or your DB connector
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  const { userId, approvedHours } = req.body;

  if (typeof userId !== 'number' || typeof approvedHours !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Fetch the current user to compute the delta for logging
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { approvedHours },
    });

    // Record an audit entry in HoursLog when approvedHours changed
    const delta = Number(approvedHours) - Number(existing.approvedHours || 0);
    if (delta !== 0) {
      const performer = session?.user?.email ?? 'system';
      await prisma.hoursLog.create({
        data: {
          userId,
          action: 'admin-adjust',
          hours: delta,
          performedBy: performer,
        },
      });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Database update failed:', error);
    return res.status(500).json({ error: 'Failed to update approved hours' });
  }
}
