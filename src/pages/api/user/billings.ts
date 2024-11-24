import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const billingHistory = await prisma.billing.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' }, // Ensure 'createdAt' exists in the schema
      });
      return res.status(200).json(billingHistory);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
