import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        approvedHours: user.approvedHours + user.pendingHours,
        pendingHours: 0,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in approve handler:', error);
    return res.status(500).json({ error: 'Failed to approve hours' });
  }
}
