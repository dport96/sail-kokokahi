import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // Use Prisma or your DB connector

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, approvedHours } = req.body;

    if (typeof userId !== 'number' || typeof approvedHours !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { approvedHours },
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Database update failed:', error);
      return res.status(500).json({ error: 'Failed to update approved hours' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
