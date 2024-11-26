import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      console.error('Missing userId in request query');
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      console.log(`Fetching billing history for user ID: ${userId}`);
      const billingHistory = await prisma.billing.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' }, // Ensure 'createdAt' exists in your schema
      });

      if (billingHistory.length === 0) {
        console.log(`No billing history found for user ID: ${userId}`);
        return res.status(404).json({ error: 'No billing history found' });
      }

      console.log(`Successfully fetched billing history for user ID: ${userId}`);
      return res.status(200).json(billingHistory);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    console.error(`Method ${req.method} Not Allowed`);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
