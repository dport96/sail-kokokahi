import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Ensure the caller is an admin
  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const userIdParam = req.query.userId;
  const userId = Number(userIdParam);
  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const attended = await prisma.userEvent.findMany({
      where: { userId, attended: true },
      include: { Event: true },
      orderBy: { Event: { date: 'desc' } },
    });

    const signups = await prisma.userEvent.findMany({
      where: { userId, attended: false },
      include: { Event: true },
      orderBy: { Event: { date: 'asc' } },
    });

    return res.status(200).json({ attended, signups });
  } catch (err) {
    console.error('Error fetching user events:', err);
    return res.status(500).json({ error: 'Failed to fetch user events' });
  }
}
