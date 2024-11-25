import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string, 10) },
        select: { cardNumber: true, cardExpiry: true, cardCVV: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { userId, cardNumber, cardExpiry, cardCVV } = req.body;

    if (!userId || !cardNumber || !cardExpiry || !cardCVV) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: { cardNumber, cardExpiry, cardCVV },
      });

      return res.status(200).json({ message: 'Payment details updated', user: updatedUser });
    } catch (error) {
      console.error('Error updating payment details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
