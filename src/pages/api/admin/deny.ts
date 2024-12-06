import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pendingHours: 0,
      },
    });

    await prisma.event.updateMany({
      where: {
        users: {
          some: { userId }, // Use 'some' because 'users' is a one-to-many relation
        },
      },
      data: { status: 'denied' },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error during deny operation:', error);
    return res.status(500).json({ error: 'Failed to deny hours' });
  }
}
