import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = req.body;

  try {
    const session = await getServerSession(req, res, authOptions);

    // Get user before updating to capture pending hours being denied
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deniedHours = Number(user.pendingHours || 0);

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

    // Create a HoursLog entry for the denial (if any pending hours were denied)
    if (deniedHours > 0) {
      const performer = session?.user?.email ?? 'system';
      await prisma.hoursLog.create({
        data: {
          userId,
          action: `Denied ${deniedHours} pending hours`,
          hours: -deniedHours,
          performedBy: performer,
        },
      });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error during deny operation:', error);
    return res.status(500).json({ error: 'Failed to deny hours' });
  }
}
